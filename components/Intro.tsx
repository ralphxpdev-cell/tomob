'use client'
import { useEffect } from 'react'

export default function Intro() {
  useEffect(() => {
    let ran = false
    function run() {
      if (ran) return
      ran = true

      const chars = document.querySelectorAll<HTMLElement>('.ic')
      const intro = document.getElementById('intro')
      const page = document.getElementById('page')
      if (!chars.length || !intro || !page) return

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
  }, [])

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
