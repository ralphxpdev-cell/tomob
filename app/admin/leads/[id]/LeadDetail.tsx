'use client'

// /admin/leads/[id] 상세 UI. 목록과 같은 다크 콘솔 톤(admin.module.css)을 그대로 쓴다.
// 톤·기능범위 결정 근거는 app/admin/AdminList.tsx, app/admin/actions.ts 상단 주석 참고.
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../../admin.module.css'
import {
  updateLeadStatus,
  addLeadNote,
  resendLeadTelegram,
  type LeadDetail as Detail,
  type ActionResult,
} from '../../actions'
import { LEAD_STATUS_LABEL, allowedNextStatuses } from '../../lead-status'

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function LeadDetail({ lead }: { lead: Detail }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string>()
  const [note, setNote] = useState('')
  const [resendMsg, setResendMsg] = useState<string>()

  const nextStates = allowedNextStatuses(lead.status)

  function run(fn: () => Promise<ActionResult>, after?: () => void) {
    setErr(undefined)
    startTransition(async () => {
      const r = await fn()
      if (!r.ok) setErr(r.error)
      else {
        after?.()
        router.refresh()
      }
    })
  }

  function handleResend() {
    setErr(undefined)
    setResendMsg(undefined)
    startTransition(async () => {
      const r = await resendLeadTelegram(lead.id)
      if (!r.ok) setErr(r.error)
      else setResendMsg('텔레그램으로 다시 보냈습니다.')
    })
  }

  return (
    <main className={styles.page}>
      <div aria-hidden className={styles.glow} />

      <div className={styles.inner}>
        <div className={styles.backRow}>
          <Link href="/admin" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            접수 관리
          </Link>
          <span className={styles.badge}>Admin</span>
        </div>

        <header className={styles.detailHeader}>
          <div>
            <div className={styles.detailTitleRow}>
              <h1 className={styles.title}>{lead.company || '(회사명 없음)'}</h1>
              <span className={`${styles.statusPill} ${styles[`status_${lead.status}`]}`}>
                {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
              </span>
            </div>
            <p className={styles.detailSub}>
              접수 {fmtDateTime(lead.created_at)}
              {lead.industry ? ` · ${lead.industry}` : ''}
            </p>
          </div>
          <button type="button" disabled={pending} onClick={handleResend} className={styles.resendBtn}>
            <span className={styles.resendDot} />
            텔레그램 재전송
          </button>
        </header>

        {err && <p className={styles.alertError}>{err}</p>}
        {resendMsg && <p className={styles.alertOk}>{resendMsg}</p>}

        <div className={styles.detailGrid}>
          {/* 좌: 신청 내용 */}
          <div className={styles.detailMain}>
            <Section title="신청 내용" sub="REQUEST">
              <dl className={styles.fieldGrid}>
                <Field label="이메일" value={lead.email} mono />
                <Field label="연락처" value={lead.phone || '적지 않음'} mono />
                <Field label="업종" value={lead.industry || '적지 않음'} />
                <Field label="희망 연락 시간대" value={lead.preferred_contact_time || '적지 않음'} />
              </dl>
              {lead.repeat_task && (
                <div className={styles.fieldBlock}>
                  <FieldLabel>반복 업무</FieldLabel>
                  <p className={styles.fieldBody}>{lead.repeat_task}</p>
                </div>
              )}
              {lead.tools && lead.tools.length > 0 && (
                <div className={styles.fieldBlock}>
                  <FieldLabel>쓰는 도구</FieldLabel>
                  <p className={styles.fieldBody}>{lead.tools.join(', ')}</p>
                </div>
              )}
              <div className={styles.fieldBlock}>
                <FieldLabel>자가진단 체크 항목 ({lead.checked_items?.length ?? 0}개)</FieldLabel>
                {lead.checked_items && lead.checked_items.length > 0 ? (
                  <ul className={styles.checkList}>
                    {lead.checked_items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.fieldBody}>체크한 항목 없음</p>
                )}
              </div>
              <div className={styles.fieldBlock}>
                <FieldLabel>광고성 정보 수신 동의</FieldLabel>
                <p className={styles.fieldBody}>{lead.consent ? '동의' : '동의하지 않음'}</p>
              </div>
            </Section>

            <Section title="진행 이력" sub="TIMELINE">
              {lead.updates.length === 0 && <p className={styles.emptySmall}>아직 상태 변경 이력이 없습니다.</p>}
              <ol className={styles.timeline}>
                {lead.updates.map((u) => (
                  <li key={u.id} className={styles.timelineItem}>
                    <span className={styles.timelineDot} />
                    <div className={styles.timelineRow}>
                      <span className={styles.timelineLabel}>
                        {u.from_status ? `${LEAD_STATUS_LABEL[u.from_status as keyof typeof LEAD_STATUS_LABEL] ?? u.from_status} → ` : ''}
                        {LEAD_STATUS_LABEL[u.to_status as keyof typeof LEAD_STATUS_LABEL] ?? u.to_status}
                      </span>
                      <span className={styles.rowMono}>{fmtDateTime(u.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          </div>

          {/* 우: 액션 사이드바 */}
          <aside className={styles.detailAside}>
            <Card title="상태 변경" sub="TRANSITION">
              <p className={styles.cardHint}>
                현재 <strong>{LEAD_STATUS_LABEL[lead.status]}</strong> — 이동할 상태를 선택합니다.
              </p>
              <div className={styles.transitionList}>
                {nextStates.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => updateLeadStatus(lead.id, s))}
                    className={styles.transitionBtn}
                  >
                    {LEAD_STATUS_LABEL[s]}(으)로 이동
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className={styles.cardFootnote}>상태 변경 시 텔레그램 알림 + 진행 이력이 자동으로 남습니다.</p>
            </Card>

            <Card title="내부 메모" sub="INTERNAL" warn>
              <p className={styles.cardHintWarn}>고객에게 노출되지 않습니다.</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="내부용 메모…"
                className={styles.noteInput}
              />
              <button
                type="button"
                disabled={pending || note.trim().length < 1}
                onClick={() => run(() => addLeadNote(lead.id, note), () => setNote(''))}
                className={styles.noteSaveBtn}
              >
                메모 저장
              </button>
              <ul className={styles.noteList}>
                {lead.notes.length === 0 && <li className={styles.emptySmall}>메모 없음</li>}
                {lead.notes.map((n) => (
                  <li key={n.id} className={styles.noteItem}>
                    <p className={styles.rowMono}>{fmtDateTime(n.created_at)}</p>
                    <p className={styles.noteBody}>{n.body}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionDot} />
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.sectionSub}>{sub}</span>
      </div>
      {children}
    </section>
  )
}

function Card({ title, sub, warn, children }: { title: string; sub: string; warn?: boolean; children: React.ReactNode }) {
  return (
    <section className={`${styles.asideCard} ${warn ? styles.asideCardWarn : ''}`}>
      <div className={styles.sectionHead}>
        <span className={`${styles.sectionDot} ${warn ? styles.sectionDotWarn : ''}`} />
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.sectionSub}>{sub}</span>
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.fieldLabel}>{children}</span>
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className={mono ? styles.fieldValueMono : styles.fieldValue}>{value}</p>
    </div>
  )
}
