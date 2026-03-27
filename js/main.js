// ── Intro (폰트 로딩 후 실행 — 검정화면 방지) ──
let introRan = false;
function runIntro() {
  if (introRan) return;
  introRan = true;

  const chars = document.querySelectorAll('.ic');
  const intro = document.getElementById('intro');
  const page = document.getElementById('page');
  if (!chars.length || !intro || !page) return;

  chars.forEach((c, i) => {
    setTimeout(() => {
      c.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1),opacity .45s ease';
      c.style.transform = 'translateY(0)';
      c.style.opacity = '1';
    }, 180 + i * 55);
  });
  setTimeout(() => {
    intro.classList.add('out');
    setTimeout(() => {
      intro.style.display = 'none';
      page.classList.add('show');
    }, 600);
  }, 180 + chars.length * 55 + 900);
}

// 폰트가 로드되면 인트로 시작, 2초 안에 안 되면 강제 시작
if (document.fonts && document.fonts.ready) {
  Promise.race([
    document.fonts.ready,
    new Promise(r => setTimeout(r, 2000))
  ]).then(runIntro);
} else {
  window.addEventListener('load', runIntro);
}
// 최후 안전장치 — 5초 후에도 인트로가 안 끝났으면 강제 스킵
setTimeout(() => {
  const intro = document.getElementById('intro');
  const page = document.getElementById('page');
  if (intro && intro.style.display !== 'none') {
    intro.style.display = 'none';
    if (page) page.classList.add('show');
  }
}, 5000);

// ── Portfolio stagger ──
const pItems = document.querySelectorAll('.project-item');
const pObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 150);
      pObs.unobserve(e.target);
    }
  });
}, { threshold: .15 });
pItems.forEach(el => pObs.observe(el));

// ── Reveal ──
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: .1 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ── Process ──
const pio = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 110);
      pio.unobserve(e.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('#procGrid .proc-item').forEach(el => pio.observe(el));

// ── 커스텀 커서 ──
(function () {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const hoverEls = 'a, button, .feature, .project-item, .hcta, .cta-btn, .ncta';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ── 스크롤 관성 (transform 방식 — GPU 즉시반응, 딜레이 없음) ──
(function () {
  if ('ontouchstart' in window) return;
  if (window.innerWidth < 768) return;

  const page = document.getElementById('page');
  if (!page) return;

  // #page 고정 배치 (transform으로 이동)
  page.style.cssText += ';position:fixed;top:0;left:0;width:100%;will-change:transform;';

  // body 높이 = 실제 콘텐츠 높이 (스크롤바 생성용)
  function syncHeight() {
    document.body.style.height = page.offsetHeight + 'px';
  }
  syncHeight();
  window.addEventListener('resize', syncHeight, { passive: true });
  window.addEventListener('load', syncHeight);
  // 이미지/비디오 로딩 후 높이 변경 감지
  const _ro = new ResizeObserver(syncHeight);
  _ro.observe(page);

  let target = 0;
  let current = 0;

  // 네이티브 스크롤(키보드·스크롤바)로 target 업데이트
  window.addEventListener('scroll', () => {
    target = window.scrollY;
  }, { passive: true });

  (function tick() {
    current += (target - current) * 0.1;
    page.style.transform = `translateY(${-current}px)`;
    requestAnimationFrame(tick);
  })();
})();

// ── Smooth anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    // transform 환경: 요소의 자연 위치 = 현재 시각 위치 + 현재 스크롤
    const targetY = t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: targetY, behavior: 'instant' });
  });
});

// ── TOMOB 02: 펼침 → 수렴 → 3시 발사 루프 ──
(function () {
  const svg = document.getElementById('radiate-lines');
  const wrap = document.getElementById('radiate-svg');
  const rays = svg ? Array.from(svg.querySelectorAll('.ray')) : [];
  const shooter = document.getElementById('ray-shoot');
  if (!svg || !rays.length || !shooter) return;

  const CX = 200, CY = 130;
  let isVisible = false;

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function animateAttr(el, attr, from, to, duration) {
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        if (!isVisible) { resolve(); return; }
        const t = Math.min((now - start) / duration, 1);
        el.setAttribute(attr, from + (to - from) * ease(t));
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  async function spread() {
    const ps = rays.map((ray, i) => new Promise(resolve => {
      setTimeout(() => {
        const tx2 = parseFloat(ray.dataset.x2);
        const ty2 = parseFloat(ray.dataset.y2);
        const cx2 = parseFloat(ray.getAttribute('x2'));
        const cy2 = parseFloat(ray.getAttribute('y2'));
        Promise.all([
          animateAttr(ray, 'x2', cx2, tx2, 600),
          animateAttr(ray, 'y2', cy2, ty2, 600)
        ]).then(resolve);
      }, i * 50);
    }));
    await Promise.all(ps);
  }

  async function converge() {
    const ps = rays.map((ray, i) => new Promise(resolve => {
      setTimeout(() => {
        const ox2 = parseFloat(ray.dataset.x2);
        const oy2 = parseFloat(ray.dataset.y2);
        Promise.all([
          animateAttr(ray, 'x2', ox2, CX + (ox2 - CX) * 0.06, 700),
          animateAttr(ray, 'y2', oy2, CY + (oy2 - CY) * 0.06, 700)
        ]).then(resolve);
      }, i * 55);
    }));
    await Promise.all(ps);
  }

  async function shoot() {
    shooter.setAttribute('opacity', '1');
    shooter.setAttribute('x2', '202');
    await animateAttr(shooter, 'x2', 202, 420, 1000);
  }

  function hideShooter() {
    shooter.setAttribute('opacity', '0');
    shooter.setAttribute('x2', '202');
  }

  function resetRays() {
    rays.forEach(ray => {
      ray.setAttribute('x2', ray.dataset.x2);
      ray.setAttribute('y2', ray.dataset.y2);
      ray.style.stroke = '';
    });
  }

  async function loop() {
    if (!isVisible) return;

    wrap.classList.remove('converged');
    hideShooter();
    resetRays();
    await spread();
    if (!isVisible) return;
    await new Promise(r => setTimeout(r, 400));
    if (!isVisible) return;

    await converge();
    if (!isVisible) return;
    wrap.classList.add('converged');
    await new Promise(r => setTimeout(r, 300));
    if (!isVisible) return;

    await shoot();
    if (!isVisible) return;
    await new Promise(r => setTimeout(r, 500));
    if (!isVisible) return;

    wrap.classList.remove('converged');
    hideShooter();
    await new Promise(r => setTimeout(r, 400));
    if (isVisible) loop();
  }

  function reset() {
    isVisible = false;
    wrap.classList.remove('converged');
    hideShooter();
    resetRays();
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { isVisible = true; loop(); }
      else { reset(); }
    });
  }, { threshold: 0.4 });

  obs.observe(wrap);
})();

// ── Hero 타이핑 루프 ──
(function () {
  const el = document.getElementById('htCycle');
  if (!el) return;
  const words = ['AI?', '로고?', '광고?'];
  let wi = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 120, SPEED_DEL = 80, PAUSE = 1400;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, PAUSE); return; }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); return; }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  setTimeout(tick, 800);
})();

// ── Feature 마우스 트래킹 (플래시라이트) ──
document.querySelectorAll('.feature').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    el.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});
