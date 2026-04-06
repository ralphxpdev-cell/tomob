'use client'
import { useEffect } from 'react'

export default function ClientEffects() {
  useEffect(() => {

    // ── Portfolio stagger ──
    const pItems = document.querySelectorAll<HTMLElement>('.project-item')
    const pObs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => (e.target as HTMLElement).classList.add('visible'), i * 150)
          pObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })
    pItems.forEach(el => pObs.observe(el))

    // ── Reveal ──
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.rv').forEach(el => io.observe(el))

    // ── Process stagger ──
    const pio = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 110)
          pio.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('#procGrid .proc-item').forEach(el => pio.observe(el))

    // ── Smooth scroll inertia ──
    let rafScroll: number
    const page = document.getElementById('page')
    if (page && !('ontouchstart' in window) && window.innerWidth >= 768) {
      page.style.cssText += ';position:fixed;top:0;left:0;width:100%;'
      let target = 0, current = 0

      const syncHeight = () => { document.body.style.height = page.offsetHeight + 'px' }
      syncHeight()
      window.addEventListener('resize', syncHeight, { passive: true })
      const ro = new ResizeObserver(syncHeight)
      ro.observe(page)

      window.addEventListener('scroll', () => { target = window.scrollY }, { passive: true })

      const tick = () => {
        current += (target - current) * 0.1
        page.style.transform = `translateY(${-current}px)`
        rafScroll = requestAnimationFrame(tick)
      }
      tick()
    }

    // ── Smooth anchor scroll ──
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = (a as HTMLAnchorElement).getAttribute('href')
        if (!href) return
        const t = document.querySelector(href)
        if (!t) return
        e.preventDefault()
        const targetY = t.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: targetY, behavior: 'instant' })
      })
    })

    // ── Radiate SVG ──
    ;(function () {
      const svg = document.getElementById('radiate-lines')
      const wrap = document.getElementById('radiate-svg') as HTMLElement | null
      const rays = svg ? Array.from(svg.querySelectorAll<SVGLineElement>('.ray')) : []
      const shooter = document.getElementById('ray-shoot') as SVGLineElement | null
      if (!svg || !rays.length || !shooter || !wrap) return
      const w = wrap

      const CX = 200, CY = 130
      let isVisible = false

      function ease(t: number) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t }

      function animateAttr(el: SVGLineElement, attr: string, from: number, to: number, dur: number): Promise<void> {
        return new Promise(resolve => {
          const start = performance.now()
          function tick(now: number) {
            if (!isVisible) { resolve(); return }
            const t = Math.min((now - start) / dur, 1)
            el.setAttribute(attr, String(from + (to - from) * ease(t)))
            if (t < 1) requestAnimationFrame(tick); else resolve()
          }
          requestAnimationFrame(tick)
        })
      }

      const spread = () => Promise.all(rays.map((ray, i) => new Promise<void>(resolve => {
        setTimeout(async () => {
          const tx2 = parseFloat(ray.dataset.x2 || '0')
          const ty2 = parseFloat(ray.dataset.y2 || '0')
          await Promise.all([
            animateAttr(ray, 'x2', parseFloat(ray.getAttribute('x2') || '0'), tx2, 600),
            animateAttr(ray, 'y2', parseFloat(ray.getAttribute('y2') || '0'), ty2, 600),
          ])
          resolve()
        }, i * 50)
      })))

      const converge = () => Promise.all(rays.map((ray, i) => new Promise<void>(resolve => {
        setTimeout(async () => {
          const ox2 = parseFloat(ray.dataset.x2 || '0')
          const oy2 = parseFloat(ray.dataset.y2 || '0')
          await Promise.all([
            animateAttr(ray, 'x2', ox2, CX + (ox2 - CX) * 0.06, 700),
            animateAttr(ray, 'y2', oy2, CY + (oy2 - CY) * 0.06, 700),
          ])
          resolve()
        }, i * 55)
      })))

      const shoot = async () => {
        shooter.setAttribute('opacity', '1')
        shooter.setAttribute('x2', '202')
        await animateAttr(shooter, 'x2', 202, 420, 1000)
      }

      const hideShooter = () => { shooter.setAttribute('opacity', '0'); shooter.setAttribute('x2', '202') }
      const resetRays = () => rays.forEach(r => {
        r.setAttribute('x2', r.dataset.x2 || '0')
        r.setAttribute('y2', r.dataset.y2 || '0')
        r.style.stroke = ''
      })

      const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

      async function loop() {
        if (!isVisible) return
        wrap.classList.remove('converged'); hideShooter(); resetRays()
        await spread(); if (!isVisible) return
        await delay(400); if (!isVisible) return
        await converge(); if (!isVisible) return
        wrap.classList.add('converged')
        await delay(300); if (!isVisible) return
        await shoot(); if (!isVisible) return
        await delay(500); if (!isVisible) return
        wrap.classList.remove('converged'); hideShooter()
        await delay(400)
        if (isVisible) loop()
      }

      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { isVisible = true; loop() }
          else { isVisible = false; wrap.classList.remove('converged'); hideShooter(); resetRays() }
        })
      }, { threshold: 0.4 })
      obs.observe(wrap)
    })()

    // ── Hero typing ──
    ;(function () {
      const el = document.getElementById('htCycle')
      if (!el) return
      const words = ['AI?', '로고?', '광고?']
      let wi = 0, ci = 0, del = false
      function tick() {
        const word = words[wi]
        if (!del) {
          el.textContent = word.slice(0, ++ci)
          if (ci === word.length) { del = true; setTimeout(tick, 1400); return }
        } else {
          el.textContent = word.slice(0, --ci)
          if (ci === 0) { del = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); return }
        }
        setTimeout(tick, del ? 80 : 120)
      }
      setTimeout(tick, 800)
    })()

    // ── Feature mouse tracking ──
    document.querySelectorAll<HTMLElement>('.feature').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', (e.clientX - rect.left) + 'px')
        el.style.setProperty('--my', (e.clientY - rect.top) + 'px')
      })
    })

    return () => {
      cancelAnimationFrame(rafScroll)
    }
  }, [])

  return null
}
