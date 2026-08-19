/**
 * `/ax` 무료 30분 업무점검 신청 접수 — 2026-08-13 신설, 2026-08-14 확장.
 *
 * 받은 리드를 TOMOB Ax 텔레그램 그룹으로 즉시 보내고, 동시에 Supabase(`ax_leads`)에 저장한다.
 * tomob-seed(별도 서버)에는 의존하지 않는다 — DB만 같은 Supabase 프로젝트를 재사용한다.
 * 저장해야 관리자 페이지(`/admin`)에서 조회할 수 있다. 텔레그램 실패는 저장을 막지 않고,
 * 저장 실패는 텔레그램 발송을 막지 않는다 — 하나가 죽어도 나머지는 남는다.
 *
 * 정보통신망법상 광고성 정보 수신 동의는 분쟁 시 입증책임이 발송자에게 있어
 * 동의 일시·경로·항목이 남아야 한다. 그래서 동의 안 함도 그대로 적는다.
 *
 * 환경변수: TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID · SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY
 */
import { createServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type Payload = {
  checked?: unknown
  total?: unknown
  company?: unknown
  industry?: unknown
  repeatTask?: unknown
  tools?: unknown
  preferredTime?: unknown
  email?: unknown
  phone?: unknown
  consent?: unknown
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const strArray = (value: unknown, max: number) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').slice(0, max)
    : []

function parse(body: Payload) {
  return {
    checked: strArray(body.checked, 20),
    total: typeof body.total === 'number' ? body.total : 0,
    company: text(body.company, 80),
    industry: text(body.industry, 60),
    repeatTask: text(body.repeatTask, 400),
    tools: strArray(body.tools, 10),
    preferredTime: text(body.preferredTime, 60),
    email: text(body.email, 160),
    phone: text(body.phone, 40),
    consent: body.consent === true,
  }
}

function buildMessage(p: ReturnType<typeof parse>) {
  const stamp = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const lines = [
    '[TOMOB AX] 무료 30분 업무점검 신청',
    '',
    `회사: ${p.company || '적지 않음'}`,
    `업종: ${p.industry || '적지 않음'}`,
    `이메일: ${p.email || '적지 않음'}`,
    `연락처: ${p.phone || '적지 않음'}`,
    p.preferredTime ? `희망 연락 시간대: ${p.preferredTime}` : null,
    '',
    p.repeatTask ? `반복 업무: ${p.repeatTask}` : null,
    p.tools.length ? `쓰는 도구: ${p.tools.join(', ')}` : null,
    '',
    `자가진단 해당 항목 ${p.checked.length}/${p.total}`,
    ...p.checked.map((item) => `  ${item}`),
    '',
    p.consent
      ? `광고성 정보 수신 동의: 동의 · ${stamp} · /ax 업무점검 신청`
      : '광고성 정보 수신 동의: 동의하지 않음 (문자 발송 금지)',
  ]

  return lines.filter((line) => line !== null).join('\n').slice(0, 4096)
}

export async function POST(request: Request) {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return Response.json({ ok: false, error: 'bad request' }, { status: 400 })
  }

  const p = parse(body)
  if (!p.email.includes('@')) {
    return Response.json({ ok: false, error: 'email required' }, { status: 400 })
  }

  const [telegramResult, dbResult] = await Promise.allSettled([sendTelegram(p), saveLead(p)])

  if (telegramResult.status === 'rejected') {
    console.error('paincheck: telegram failed', telegramResult.reason)
  }
  if (dbResult.status === 'rejected') {
    console.error('paincheck: supabase insert failed', dbResult.reason)
  }

  // 둘 다 실패했을 때만 방문자에게 실패로 알린다. 하나라도 남았으면 리드는 살아 있다.
  if (telegramResult.status === 'rejected' && dbResult.status === 'rejected') {
    return Response.json({ ok: false, error: 'send failed' }, { status: 502 })
  }

  return Response.json({ ok: true })
}

async function sendTelegram(p: ReturnType<typeof parse>) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing')

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(p),
      disable_web_page_preview: true,
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`telegram ${response.status}: ${detail}`)
  }
}

async function saveLead(p: ReturnType<typeof parse>) {
  const sb = createServiceClient()
  const { error } = await sb.from('ax_leads').insert({
    company: p.company || null,
    industry: p.industry || null,
    repeat_task: p.repeatTask || null,
    tools: p.tools,
    preferred_contact_time: p.preferredTime || null,
    email: p.email,
    phone: p.phone || null,
    checked_items: p.checked,
    consent: p.consent,
  })
  if (error) throw error
}
