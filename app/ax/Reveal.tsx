'use client'

import { useEffect } from 'react'

/**
 * ref: agr.studio
 * 실측(2026-08-07): 전 섹션에 스크롤 리빌이 걸려 있고, 수치는 0에서 카운트업한다.
 * data-reveal  → 뷰포트 진입 시 .isIn 부여 (data-reveal-delay로 계단식 지연)
 * data-count   → 진입 시 0부터 목표 숫자까지 증가
 */
export default function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))

    if (reduced) {
      targets.forEach((el) => el.classList.add('isIn'))
      counters.forEach((el) => {
        el.textContent = `${el.dataset.count ?? ''}${el.dataset.countSuffix ?? ''}`
      })
      return
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay ?? 0)
          window.setTimeout(() => el.classList.add('isIn'), delay)
          revealObserver.unobserve(el)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((el) => revealObserver.observe(el))

    const timers: number[] = []
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const target = Number(el.dataset.count ?? 0)
          const suffix = el.dataset.countSuffix ?? ''
          const duration = 1100
          const started = performance.now()

          const step = (now: number) => {
            const t = Math.min((now - started) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            el.textContent = `${Math.round(target * eased)}${suffix}`
            if (t < 1) timers.push(requestAnimationFrame(step))
          }
          timers.push(requestAnimationFrame(step))
          countObserver.unobserve(el)
        })
      },
      { threshold: 0.5 }
    )
    counters.forEach((el) => countObserver.observe(el))

    return () => {
      revealObserver.disconnect()
      countObserver.disconnect()
      timers.forEach((id) => cancelAnimationFrame(id))
    }
  }, [])

  return null
}
