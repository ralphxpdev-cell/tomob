'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

/**
 * 히어로 진술문 — ref: watson.la (사령관 지정, 2026-08-10)
 *
 * 실측(1440 뷰포트):
 *   진술문 89.1px / line-height 89.86px / letter-spacing -2.23px
 *   산세리프(weight 200) + 세리프(weight 400) 혼용, 강조구에 밑줄, 각주 번호 (1)(2)(3)
 *   문장 안 미디어 칩 79×99 · 135×99, radius 0, 계속 교체됨
 *
 * watson에는 `<video>`가 없다(DOM 실측: video 0개). "영상처럼 보이는 것"의 정체는
 * 문장 안 이미지 칩이 주기적으로 바뀌는 것이다 → 여기서도 같은 기법으로 간다.
 * 칩에 들어가는 것은 **실제 작업물 캡처**다. 새로 지어내지 않는다.
 *
 * /ax는 1440x900 안에 워드마크까지 같이 들어가야 하므로 89px을 그대로 쓰지 않고
 * 화면 폭에 따라 줄인다(비율은 유지).
 */

// 칩은 작아서 대비가 약한 카드는 내용이 안 읽힌다(실렌더 확인: PEACH 연분홍 카드는 빈 판으로 보임).
// 대비가 확실한 캡처만 쓴다.
const CHIPS_A = [
  { src: '/ax/work/card-lime.png', alt: 'LIME 상세페이지 자동생성' },
  { src: '/ax/work/card-starlight.png', alt: '스타딜리버리 브랜드 캠페인' },
  { src: '/ax/work/card-flowing.png', alt: 'FLOWING 소개팅 서비스' },
]

const CHIPS_B = [
  { src: '/ax/work/card-tomob.png', alt: 'tomob 웹게임 제작 시스템' },
  { src: '/ax/work/card-seed.png', alt: 'TOMOB SEED 접수 포털' },
  { src: '/ax/work/card-seedlog.png', alt: 'SEEDLOG 농업 데이터 기록' },
]

/**
 * 2026-08-11 사령관 "움직이는 GIF도 넘 별로".
 * 원인은 1.9초 하드컷이었다. 원본은 9초 간격 캡처에서 한 번 바뀔 만큼 느리다.
 * → 6초 간격 + 0.8초 크로스페이드. 이미지를 전부 겹쳐 두고 불투명도만 바꾼다.
 */
const INTERVAL = 6000

function Chip({ list, index, wide }: { list: { src: string; alt: string }[]; index: number; wide?: boolean }) {
  const active = index % list.length
  return (
    <span className={`${styles.chipBox} ${wide ? styles.chipBoxWide : ''}`}>
      {list.map((c, n) => (
        <img
          key={c.src}
          className={`${styles.chip} ${n === active ? styles.chipOn : ''}`}
          src={c.src}
          alt={n === active ? c.alt : ''}
          aria-hidden={n === active ? undefined : true}
        />
      ))}
    </span>
  )
}

export default function HeroStatement() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setI((n) => n + 1), INTERVAL)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className={styles.statementBig}>
      <span className={styles.thin}>(서울)</span> 작은 기업의{' '}
      <span className={styles.noBreak}>
        <em className={styles.serifMark}>반복 업무</em>
        <sup>(1)</sup>를
      </span>{' '}
      찾아 <Chip list={CHIPS_A} index={i} />{' '}
      <em className={styles.serifMark}>실제로 운영되는</em>{' '}
      <span className={styles.noBreak}>
        <em className={styles.serifMark}>시스템</em>
        <sup>(2)</sup>으로
      </span>{' '}
      <span className={styles.thin}>—</span> 바꾸는{' '}
      <Chip list={CHIPS_B} index={i + 1} wide /> 업무 전환{' '}
      <span className={styles.noBreak}>
        <em className={styles.serifMark}>스튜디오</em>
        <sup>(3)</sup>
      </span>
    </p>
  )
}
