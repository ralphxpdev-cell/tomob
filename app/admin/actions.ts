'use server'

// 관리자 로그인 + ax_leads(업무점검 신청) 조회·상태변경·메모 Server Actions.
//
// 기능 범위 결정(2026-08-14): tomob-seed의 admin은 다주 클라이언트 프로젝트를 관리한다
// (파일 업로드, 브리프 마크다운, 범위/확정일). ax_leads는 30분 상담 신청 한 건일 뿐이라
// 업로드할 파일도, 합의할 범위도, 확정할 납기도 없다 — 그래서 그 세 가지는 가져오지 않는다.
// 반대로 상태 전이+이력, 내부 메모, 텔레그램 재전송은 "접수 → 연락 → 처리"라는 같은 성격의
// 흐름이라 tomob-seed 패턴을 그대로 따른다(app/admin/actions.ts의 transitionStatus/
// saveInternalNote/resendTelegram 참고). admin_note 단일 컬럼은 새 ax_lead_notes 테이블로
// 대체한다 — 메모가 누적 이력이어야 "언제 무슨 판단을 했는지"가 남는다.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceClient } from '@/lib/supabase'
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from './lead-status'

export type ActionResult = { ok: true } | { ok: false; error: string }

const COOKIE = 'ax_admin_session'

function sessionValue(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET 환경변수가 없습니다.')
  return createHmac('sha256', secret).update('valid').digest('hex')
}

export async function login(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || password !== expected) {
    redirect('/admin/login?error=1')
  }
  const jar = await cookies()
  jar.set(COOKIE, sessionValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
  redirect('/admin')
}

export async function logout() {
  const jar = await cookies()
  jar.delete(COOKIE)
  redirect('/admin/login')
}

export async function requireAdminSession() {
  const jar = await cookies()
  const value = jar.get(COOKIE)?.value ?? ''
  const expected = sessionValue()
  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  const ok = a.length === b.length && timingSafeEqual(a, b)
  if (!ok) redirect('/admin/login')
}

async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies()
  const value = jar.get(COOKIE)?.value ?? ''
  const expected = sessionValue()
  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function guard(): Promise<{ ok: false; error: string } | null> {
  if (!(await isAdminAuthed())) return { ok: false, error: '로그인이 필요합니다.' }
  return null
}

// ── 조회 타입 ────────────────────────────────────────
export type Lead = {
  id: string
  created_at: string
  company: string | null
  industry: string | null
  repeat_task: string | null
  tools: string[] | null
  preferred_contact_time: string | null
  email: string
  phone: string | null
  checked_items: string[] | null
  consent: boolean
  status: LeadStatus
}

export type LeadUpdate = {
  id: string
  from_status: string | null
  to_status: string
  created_at: string
}

export type LeadNote = {
  id: string
  body: string
  created_at: string
}

export type LeadDetail = Lead & {
  updates: LeadUpdate[]
  notes: LeadNote[]
}

export async function listLeads(): Promise<Lead[]> {
  if (!(await isAdminAuthed())) return []
  const sb = createServiceClient()
  const { data, error } = await sb
    .from('ax_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  return (data ?? []) as Lead[]
}

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  if (!(await isAdminAuthed())) return null
  const sb = createServiceClient()
  const { data: lead, error } = await sb.from('ax_leads').select('*').eq('id', id).single()
  if (error || !lead) return null

  const [{ data: updates }, { data: notes }] = await Promise.all([
    sb
      .from('ax_lead_updates')
      .select('id, from_status, to_status, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
    sb
      .from('ax_lead_notes')
      .select('id, body, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
  ])

  return {
    ...(lead as Lead),
    updates: (updates ?? []) as LeadUpdate[],
    notes: (notes ?? []) as LeadNote[],
  }
}

// ── 상태 전이: 실제 업데이트 + 이력 기록 + 텔레그램 알림 ──
export async function updateLeadStatus(id: string, to: LeadStatus): Promise<ActionResult> {
  const g = await guard()
  if (g) return g
  if (!LEAD_STATUSES.includes(to)) return { ok: false, error: '잘못된 상태입니다.' }

  const sb = createServiceClient()
  const { data: lead, error: fetchError } = await sb
    .from('ax_leads')
    .select('status, company, email')
    .eq('id', id)
    .single()
  if (fetchError || !lead) return { ok: false, error: '신청 건을 찾을 수 없습니다.' }

  const from = lead.status as LeadStatus
  if (from === to) return { ok: false, error: '이미 같은 상태입니다.' }

  const { error: updateError } = await sb.from('ax_leads').update({ status: to }).eq('id', id)
  if (updateError) return { ok: false, error: '상태 변경에 실패했습니다.' }

  const { error: logError } = await sb
    .from('ax_lead_updates')
    .insert({ lead_id: id, from_status: from, to_status: to })
  if (logError) console.error('ax_lead_updates insert failed', logError)

  try {
    await sendTelegram(
      `[TOMOB AX 상태변경]\n업체: ${lead.company || lead.email}\n${LEAD_STATUS_LABEL[from]} → ${LEAD_STATUS_LABEL[to]}`,
    )
  } catch (e) {
    // 알림 실패는 상태 변경을 막지 않는다 — DB가 정본이고 텔레그램은 보조 채널이다.
    console.error('ax status telegram failed', e)
  }

  revalidatePath('/admin')
  revalidatePath(`/admin/leads/${id}`)
  return { ok: true }
}

// ── 내부 메모 ────────────────────────────────────────
export async function addLeadNote(id: string, body: string): Promise<ActionResult> {
  const g = await guard()
  if (g) return g
  const text = body.trim()
  if (text.length < 1) return { ok: false, error: '메모 내용을 입력해주세요.' }
  if (text.length > 1000) return { ok: false, error: '메모는 1000자 이내로 입력해주세요.' }

  const sb = createServiceClient()
  const { error } = await sb.from('ax_lead_notes').insert({ lead_id: id, body: text })
  if (error) return { ok: false, error: '메모 저장에 실패했습니다.' }

  revalidatePath(`/admin/leads/${id}`)
  return { ok: true }
}

// ── 텔레그램 재전송 ──────────────────────────────────
export async function resendLeadTelegram(id: string): Promise<ActionResult> {
  const g = await guard()
  if (g) return g
  const sb = createServiceClient()
  const { data: lead, error } = await sb.from('ax_leads').select('*').eq('id', id).single()
  if (error || !lead) return { ok: false, error: '신청 건을 찾을 수 없습니다.' }

  try {
    await sendTelegram(buildLeadSummary(lead as Lead))
  } catch (e) {
    console.error('ax resend telegram failed', e)
    return { ok: false, error: '전송에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
  return { ok: true }
}

function buildLeadSummary(lead: Lead): string {
  const stamp = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(lead.created_at))

  const lines = [
    '[TOMOB AX] 신청 재전송',
    '',
    `회사: ${lead.company || '적지 않음'}`,
    `업종: ${lead.industry || '적지 않음'}`,
    `이메일: ${lead.email}`,
    `연락처: ${lead.phone || '적지 않음'}`,
    lead.preferred_contact_time ? `희망 연락 시간대: ${lead.preferred_contact_time}` : null,
    '',
    lead.repeat_task ? `반복 업무: ${lead.repeat_task}` : null,
    lead.tools && lead.tools.length ? `쓰는 도구: ${lead.tools.join(', ')}` : null,
    lead.checked_items && lead.checked_items.length
      ? `자가진단 체크 ${lead.checked_items.length}개: ${lead.checked_items.join(' / ')}`
      : null,
    '',
    `접수: ${stamp}`,
    `현재 상태: ${LEAD_STATUS_LABEL[lead.status] ?? lead.status}`,
    `광고성 정보 수신 동의: ${lead.consent ? '동의' : '동의하지 않음'}`,
  ]
  return lines.filter((line) => line !== null).join('\n').slice(0, 4096)
}

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`telegram ${response.status}: ${detail}`)
  }
}
