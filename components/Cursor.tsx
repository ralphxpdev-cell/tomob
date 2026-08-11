'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Cursor() {
  const pathname = usePathname()
  /* /ax는 커스텀 커서를 쓰지 않는다. CSS로 숨기기만 하면 rAF 루프가 계속 돌아
     히어로 WebGL과 프레임을 다툰다. 아예 렌더하지 않는다. */
  const skip = pathname?.startsWith('/ax') ?? false

  useEffect(() => {
    if (skip) return

    const dot = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')
    if (!dot || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx + 'px'
      dot.style.top = my + 'px'
    }
    document.addEventListener('mousemove', onMove)

    let rafId: number
    const loop = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.left = rx + 'px'
      ring.style.top = ry + 'px'
      rafId = requestAnimationFrame(loop)
    }
    loop()

    const hoverEls = document.querySelectorAll('a, button, .feature, .project-item, .hcta, .cta-btn, .ncta')
    const addHover = () => document.body.classList.add('cursor-hover')
    const removeHover = () => document.body.classList.remove('cursor-hover')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    const onLeave = () => { dot.style.opacity = '0'; ring.style.opacity = '0' }
    const onEnter = () => { dot.style.opacity = '1'; ring.style.opacity = '1' }
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, [skip])

  if (skip) return null

  return (
    <>
      <div id="cursor-dot"></div>
      <div id="cursor-ring"></div>
    </>
  )
}
