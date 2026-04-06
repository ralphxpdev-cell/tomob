'use client'
import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
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
  }, [])

  return (
    <>
      <div id="cursor-dot"></div>
      <div id="cursor-ring"></div>
    </>
  )
}
