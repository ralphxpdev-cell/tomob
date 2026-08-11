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
 */

const ITEMS = [
  '문의가 오면 누군가 읽고 담당자에게 다시 전달한다.',
  '견적서나 보고서를 매번 복사해서 새로 만든다.',
  '고객 정보가 카톡, 메일, 엑셀에 나뉘어 있다.',
  '같은 데이터를 두 번 이상 입력한다.',
  '담당자가 쉬면 업무 상태를 아무도 모른다.',
  '일을 늘리려면 사람부터 더 뽑아야 한다.',
]

export default function PainCheck() {
  const [on, setOn] = useState<boolean[]>(() => ITEMS.map(() => false))
  const count = on.filter(Boolean).length

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, n) => (n === i ? !v : v)))

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
    </div>
  )
}
