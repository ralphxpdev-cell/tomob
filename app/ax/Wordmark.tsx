'use client'

import { useEffect, useRef } from 'react'

/**
 * ref: agr.studio 히어로/푸터 워드마크
 * 실측(2026-08-07): <canvas> 1440x178, WebGL 컨텍스트.
 * 글자 형태를 마스크로 쓰고 그 안에서 파랑↔검정 유체가 계속 흐른다.
 * → 텍스트 마스크 텍스처 + 도메인 워프 fBm 셰이더로 동일 기법 구현.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

varying vec2 vUv;
uniform sampler2D uMask;
uniform float uTime;
uniform float uAspect;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  // 4옥타브. 더 올리면 잔털 같은 결이 생겨 실크가 아니라 불꽃처럼 보인다.
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float mask = texture2D(uMask, vec2(vUv.x, 1.0 - vUv.y)).a;
  if (mask < 0.004) discard;

  // 화면상 등방(等方) 좌표. uAspect를 곱하지 않으면 무늬가 가로로 눌려 줄무늬가 된다.
  vec2 p = vec2(vUv.x * uAspect, vUv.y) * 0.62;
  float t = uTime * 0.075;

  // 2단 도메인 워프 — 실크/액체 느낌의 접힘을 만든다
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.3, -t * 0.8)));
  vec2 r = vec2(
    fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.42),
    fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.31)
  );
  float f = fbm(p + 2.4 * r);

  float v = clamp(f * 1.45 + 0.5, 0.0, 1.0);

  // 접힌 면이 겹치는 지점 = 밝은 하이라이트 띠
  float fold = 1.0 - smoothstep(0.0, 0.26, abs(r.x - r.y));

  // TOMOB AX 고유 색상축 — 사령관 지정 #ED441A(버밀리언) 기준. 검정→다크브릭→버밀리언→코랄 하이라이트
  // (2026-08-07: 앰버골드 1차안 폐기, #ED441A로 재지정)
  vec3 ink      = vec3(0.043, 0.012, 0.008);
  vec3 deep     = vec3(0.353, 0.078, 0.039);
  vec3 vermil   = vec3(0.929, 0.267, 0.102);
  vec3 light    = vec3(1.000, 0.784, 0.667);

  vec3 c = mix(ink, deep, smoothstep(0.02, 0.44, v));
  c = mix(c, vermil, smoothstep(0.42, 0.76, v));
  c = mix(c, light, smoothstep(0.86, 1.0, v) * 0.8);
  c = mix(c, light, fold * 0.22 * smoothstep(0.40, 0.9, v));

  gl_FragColor = vec4(c * mask, mask);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s)
    return null
  }
  return s
}

type Props = {
  text: string
  className?: string
  /** 글자 높이 대비 캔버스 상하 여유 (하이라이트가 잘리지 않게) */
  pad?: number
}

export default function Wordmark({ text, className, pad = 0.06 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    })

    // WebGL을 못 쓰는 환경이면 접근성용 텍스트만 남기고 조용히 빠진다.
    if (!gl) {
      host.dataset.fallback = 'true'
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      host.dataset.fallback = 'true'
      return
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      host.dataset.fallback = 'true'
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uMask = gl.getUniformLocation(prog, 'uMask')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uAspect = gl.getUniformLocation(prog, 'uAspect')

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.uniform1i(uMask, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const maskCanvas = document.createElement('canvas')
    let disposed = false
    let raf = 0
    let visible = true
    let start = performance.now()

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    /** 텍스트를 폭에 꽉 맞춘 알파 마스크로 굽는다. 높이는 글자 bbox에서 나온다. */
    function buildMask() {
      const cssW = host!.clientWidth
      if (!cssW) return false

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const m2d = maskCanvas.getContext('2d')
      if (!m2d) return false

      const PROBE = 200
      const font = (size: number) => `900 ${size}px Geist, "Geist Fallback", system-ui, sans-serif`

      m2d.font = font(PROBE)
      // 크롬은 letterSpacing을 지원한다. 미지원 브라우저는 기본 자간으로 떨어진다.
      try {
        ;(m2d as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-0.045em'
      } catch {
        /* noop */
      }

      const metrics = m2d.measureText(text)
      const rawW = metrics.width
      const ascent = metrics.actualBoundingBoxAscent
      const descent = metrics.actualBoundingBoxDescent
      if (!rawW || !isFinite(ascent)) return false

      const scale = cssW / rawW
      const fontSize = PROBE * scale
      const glyphH = (ascent + descent) * scale
      const padPx = glyphH * pad
      const cssH = Math.round(glyphH + padPx * 2)

      // 폭은 CSS(width:100%)가 잡고 높이는 aspect-ratio가 따라간다.
      // 인라인 px로 고정하면 리빌드가 한 번이라도 밀릴 때 캔버스가 컨테이너를 삐져나온다.
      canvas!.style.aspectRatio = `${cssW} / ${cssH}`
      maskCanvas.width = Math.round(cssW * dpr)
      maskCanvas.height = Math.round(cssH * dpr)
      canvas!.width = maskCanvas.width
      canvas!.height = maskCanvas.height

      m2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      m2d.clearRect(0, 0, cssW, cssH)
      m2d.font = font(fontSize)
      try {
        ;(m2d as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '-0.045em'
      } catch {
        /* noop */
      }
      m2d.textAlign = 'left'
      m2d.textBaseline = 'alphabetic'
      m2d.fillStyle = '#fff'
      m2d.fillText(text, 0, padPx + ascent * scale)

      gl!.bindTexture(gl!.TEXTURE_2D, tex)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, maskCanvas)
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
      gl!.uniform1f(uAspect, cssW / cssH)
      return true
    }

    function draw(now: number) {
      if (disposed) return
      gl!.clearColor(0, 0, 0, 0)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      gl!.uniform1f(uTime, reduced.matches ? 8.0 : (now - start) / 1000)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    function loop(now: number) {
      if (disposed) return
      draw(now)
      raf = requestAnimationFrame(loop)
    }

    function play() {
      if (disposed || raf) return
      raf = requestAnimationFrame(loop)
    }

    function pause() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    let ready = false
    function refresh() {
      ready = buildMask()
      if (!ready) return
      if (reduced.matches) {
        pause()
        draw(performance.now())
      } else if (visible) {
        play()
      } else {
        draw(performance.now())
      }
    }

    // Geist가 실제로 로드된 뒤 마스크를 구워야 폴백 폰트로 굳지 않는다.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.load) {
      fonts.load('900 200px Geist').catch(() => undefined).then(() => {
        if (!disposed) refresh()
      })
    }
    refresh()

    const ro = new ResizeObserver(() => refresh())
    ro.observe(host)

    // ResizeObserver를 놓치는 경우(창 크기 변경 직후 등)를 위한 보조 트리거
    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(refresh, 120)
    }
    window.addEventListener('resize', onResize)

    // 화면 밖이면 렌더 루프를 멈춘다.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !reduced.matches) play()
        else pause()
      },
      { threshold: 0 }
    )
    io.observe(host)

    const onVisibility = () => {
      if (document.hidden) pause()
      else if (visible && !reduced.matches) play()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onReducedChange = () => refresh()
    reduced.addEventListener('change', onReducedChange)

    return () => {
      disposed = true
      pause()
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onReducedChange)
      gl.deleteTexture(tex)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [text, pad])

  return (
    <div ref={hostRef} className={className}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}
