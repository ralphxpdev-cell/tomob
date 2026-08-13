'use client'

import { useState } from 'react'
import styles from './page.module.css'

/**
 * 자가 진단 체크리스트 — 기획안 §4.3 Pain.
 *
 * 2026-08-11 사령관 "난 저 흐름이 전혀 설득이 안 되는데" 판정으로 신설.
 * 히어로에서 "사람 더 뽑기 전에"라고 문제를 던져놓고 곧바로 우리 원칙을 말하던 구간에,
 * 방문자가 **자기 회사 상태를 먼저 확인하는** 단계를 넣는다.
 * 처음AX의 "도입 전후 비교표"가 이 자리에서 하는 역할과 같다.
 *
 * 항목·판정 문구는 기획안 원문 그대로다. 새로 지어내지 않는다.
 *
 * 2026-08-13 결과 받기 폼 추가.
 * 지금까지는 눌러도 우리에게 아무것도 남지 않아 설득 장치일 뿐 수집구가 아니었다.
 * 퍼널 문서(`tomob-ax/01_전략/260812_마케팅_퍼널.md`)가 랜딩에 요구하는 역할은
 * ① 이메일 확보 ② 문자 수신 동의 확보 두 가지다.
 * 콜드 문자는 사전 동의 없이 보내면 위법이라, 이 체크박스가 문자 채널을 여는 유일한 열쇠다.
 * 동의 문구는 `tomob-ax/03_아웃리치/260806_채널전략_법규가드레일.md` 원문을 그대로 쓴다.
 */

const ITEMS = [
  '문의가 오면 누군가 읽고 담당자에게 다시 전달한다.',
  '견적서나 보고서를 매번 복사해서 새로 만든다.',
  '고객 정보가 카톡, 메일, 엑셀에 나뉘어 있다.',
  '같은 데이터를 두 번 이상 입력한다.',
  '담당자가 쉬면 업무 상태를 아무도 모른다.',
  '일을 늘리려면 사람부터 더 뽑아야 한다.',
]

type Phase = 'idle' | 'sending' | 'done' | 'error'

export default function PainCheck() {
  const [on, setOn] = useState<boolean[]>(() => ITEMS.map(() => false))
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [message, setMessage] = useState('')

  const count = on.filter(Boolean).length

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, n) => (n === i ? !v : v)))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (phase === 'sending') return

    // 문자 동의를 받아도 번호가 없으면 보낼 수 없다. 동의했으면 번호를 필수로 받는다.
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
            <strong>{count}개</strong> 해당됩니다. 세 개 이상이라면, 채용보다 먼저 업무 흐름을
            점검할 가치가 있습니다.
          </>
        )}
      </p>

      {/* 하나도 안 누른 상태에서 입력칸부터 들이밀지 않는다. 한 개라도 누른 뒤에 연다. */}
      {count > 0 && phase !== 'done' && (
        <form className={styles.painForm} onSubmit={submit}>
          <p className={styles.painFormLead}>
            체크하신 항목을 기준으로 자동화 가능 범위와 예상 절감 시간을 정리해 보내드립니다.
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
            {phase === 'sending' ? '보내는 중' : '결과 받기'}
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
          접수되었습니다. 영업일 기준 하루 안에 정리해서 보내드리겠습니다.
        </p>
      )}
    </div>
  )
}
