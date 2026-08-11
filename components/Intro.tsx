'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Intro() {
  const pathname = usePathname()
  /* /ax는 메인 사이트와 무관한 독립 랜딩이다. 인트로 오버레이를 띄우지 않는다.
     2026-08-11 실측: /ax에는 #page가 없어 아래 run()이 즉시 return했고,
     오버레이를 걷는 유일한 경로가 5초 fallback 타이머뿐이라 첫 화면이 5초간 검은 판이었다. */
  const skip = pathname?.startsWith('/ax') ?? false

  useEffect(() => {
    if (skip) return

    let ran = false
    function run() {
      if (ran) return
      ran = true

      const chars = document.querySelectorAll<HTMLElement>('.ic')
      const intro = document.getElementById('intro')
      const page = document.getElementById('page')
      if (!intro) return

      /* #page가 없는 라우트에서도 오버레이는 반드시 걷는다.
         예전엔 여기서 통째로 return해 화면이 검은 채로 남았다. */
      if (!chars.length || !page) {
        intro.style.display = 'none'
        return
      }

      chars.forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1),opacity .45s ease'
          c.style.transform = 'translateY(0)'
          c.style.opacity = '1'
        }, 180 + i * 55)
      })

      setTimeout(() => {
        intro.classList.add('out')
        setTimeout(() => {
          intro.style.display = 'none'
          page.classList.add('show')
        }, 600)
      }, 180 + chars.length * 55 + 900)
    }

    if (document.fonts?.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 2000))
      ]).then(run)
    } else {
      window.addEventListener('load', run)
    }

    const fallback = setTimeout(() => {
      const intro = document.getElementById('intro')
      const page = document.getElementById('page')
      if (intro && intro.style.display !== 'none') {
        intro.style.display = 'none'
        page?.classList.add('show')
      }
    }, 5000)

    return () => clearTimeout(fallback)
  }, [skip])

  if (skip) return null

  return (
    <div id="intro">
      <span className="ic" data-i="0">T</span>
      <span className="ic" data-i="1">O</span>
      <span className="ic" data-i="2">M</span>
      <span className="ic" data-i="3">O</span>
      <span className="ic" data-i="4">B</span>
      <span className="ic dot" data-i="5">.</span>
    </div>
  )
}
