'use client'

import { useState } from 'react'
import styles from './page.module.css'

/**
 * 자가 진단 체크리스트 + 업무점검 신청 폼 — 기획안 §4.3 Pain, §4.11 Final CTA 통합.
 *
 * 2026-08-11 사령관 "난 저 흐름이 전혀 설득이 안 되는데" 판정으로 신설.
 * 2026-08-14: "무료 30분 업무점검 신청" CTA가 전부 이 섹션으로 스크롤 이동하도록 바뀌면서
 * (다른 서버 tomob-seed로 안 나가게 하기 위해), 회사명/이메일만 받던 폼을 실제 30분 점검에
 * 필요한 항목까지 받도록 확장했다. tomob-studio 자체 서버 안에서 끝난다 — 다른 서버 의존 없음.
 * 제출 시 텔레그램 즉시 전송 + Supabase(`ax_leads`) 저장, 관리자 페이지(`/admin`)에서 조회.
 */

const ITEMS = [
  '문의가 오면 누군가 읽고 담당자에게 다시 전달한다.',
  '견적서나 보고서를 매번 복사해서 새로 만든다.',
  '고객 정보가 카톡, 메일, 엑셀에 나뉘어 있다.',
  '같은 데이터를 두 번 이상 입력한다.',
  '담당자가 쉬면 업무 상태를 아무도 모른다.',
  'AI 도구를 써봤지만 업무 방식은 그대로다.',
]

const TOOLS = ['카카오톡', '엑셀', '구글 시트 · 폼', '노션', '이메일', '문자 · 전화', '기타']

type Phase = 'idle' | 'sending' | 'done' | 'error'

export default function PainCheck() {
  const [on, setOn] = useState<boolean[]>(() => ITEMS.map(() => false))
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [repeatTask, setRepeatTask] = useState('')
  const [tools, setTools] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')

  const count = on.filter(Boolean).length

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, n) => (n === i ? !v : v)))

  const toggleTool = (tool: string) =>
    setTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === 'sending') return

    if (consent && !phone.trim()) {
      setPhase('error')
      setMessage('문자로 받으시려면 연락처를 함께 남겨 주십시오.')
      return
    }

    setPhase('sending')
    setMessage('')

    try {
      const response = await fetch('/api/paincheck', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          checked: ITEMS.filter((_, i) => on[i]),
          total: ITEMS.length,
          company: company.trim(),
          industry: industry.trim(),
          repeatTask: repeatTask.trim(),
          tools,
          preferredTime: preferredTime.trim(),
          email: email.trim(),
          phone: phone.trim(),
          consent,
        }),
      })
      if (!response.ok) throw new Error('failed')
      setPhase('done')
    } catch {
      setPhase('error')
      setMessage('전송에 실패했습니다. 잠시 후 다시 시도해 주십시오.')
    }
  }

  return (
    <div className={styles.painBody}>
      <ul className={styles.painList}>
        {ITEMS.map((text, i) => (
          <li key={text}>
            <button
              type="button"
              className={`${styles.painItem} ${on[i] ? styles.painOn : ''}`}
              aria-pressed={on[i]}
              onClick={() => toggle(i)}
            >
              <span className={styles.painBox} aria-hidden="true" />
              <span>{text}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className={styles.painVerdict} role="status">
        {count === 0 ? (
          <span className={styles.painMuted}>해당되는 항목을 눌러 보세요.</span>
        ) : count < 3 ? (
          <>
            <strong>{count}개</strong> 해당됩니다. 아직은 사람이 메우는 범위가 크지 않습니다.
          </>
        ) : (
          <>
            <strong>{count}개</strong> 해당됩니다. 세 개 이상이라면, AI 도구를 넣기 전에 업무
            흐름부터 점검할 가치가 있습니다.
          </>
        )}
      </p>

      {/* 하나도 안 누른 상태에서 입력칸부터 들이밀지 않는다. 한 개라도 누른 뒤에 연다. */}
      {count > 0 && phase !== 'done' && (
        <form className={styles.painForm} onSubmit={submit}>
          <p className={styles.painFormLead}>
            무료 30분 업무점검 신청입니다. 아래 내용을 기준으로 담당자가 확인 후 연락드립니다.
          </p>

          <div className={styles.painFields}>
            <label className={styles.painField}>
              <span>회사명</span>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="선택"
                autoComplete="organization"
              />
            </label>

            <label className={styles.painField}>
              <span>업종</span>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="예: 도소매, 제조, 서비스업"
              />
            </label>
          </div>

          <label className={styles.painField}>
            <span>반복되는 업무</span>
            <textarea
              value={repeatTask}
              onChange={(e) => setRepeatTask(e.target.value)}
              placeholder="가장 시간을 많이 쓰는 업무를 적어 주세요"
              rows={3}
            />
          </label>

          <div className={styles.painField}>
            <span>지금 쓰는 도구</span>
            <div className={styles.painToolGrid}>
              {TOOLS.map((tool) => (
                <button
                  type="button"
                  key={tool}
                  className={`${styles.painTool} ${tools.includes(tool) ? styles.painToolOn : ''}`}
                  aria-pressed={tools.includes(tool)}
                  onClick={() => toggleTool(tool)}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.painFields}>
            <label className={styles.painField}>
              <span>희망 연락 시간대</span>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="예: 평일 오후"
              />
            </label>

            <label className={styles.painField}>
              <span>이메일</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="결과를 받으실 주소"
                autoComplete="email"
              />
            </label>
          </div>

          <label className={styles.painConsent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              <strong>(선택) 광고성 정보 수신에 동의합니다.</strong>
              <span className={styles.painConsentTerms}>
                수신 항목: AX 자동화 사례, 정부지원 공고 알림, 세미나 안내
                <br />
                수신 수단: 문자(SMS·알림톡), 이메일 · 보유 기간: 동의 철회 시까지
                <br />
                동의하지 않으셔도 진단 결과는 받아보실 수 있습니다.
              </span>
            </span>
          </label>

          {consent && (
            <label className={styles.painField}>
              <span>연락처</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="문자를 받으실 번호"
                autoComplete="tel"
              />
            </label>
          )}

          <button type="submit" className={styles.painSubmit} disabled={phase === 'sending'}>
            {phase === 'sending' ? '보내는 중' : '업무점검 신청'}
          </button>

          {phase === 'error' && (
            <p className={styles.painError} role="alert">
              {message}
            </p>
          )}
        </form>
      )}

      {phase === 'done' && (
        <p className={styles.painDone} role="status">
          접수되었습니다. 담당자가 확인 후 연락드리겠습니다.
        </p>
      )}
    </div>
  )
}
