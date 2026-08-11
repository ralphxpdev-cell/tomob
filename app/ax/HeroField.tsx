'use client'

import { useEffect, useRef } from 'react'

/**
 * /ax 히어로 풀페이지 배경.
 *
 * 2026-08-11 사령관 지시: "풀페이지에 우리가 만들었던 그 불꽃을 블루계열이나 우주계열로 바꾸고
 * 마우스 인터랙션하는 걸로."
 * 이어서: "이거 마우스효과 예전에 그 느낌이 아닌데? 다시 만들어."
 *
 * 1차 구현은 커서 주변 도메인을 회전시키는 **가짜 왜곡**이었다. 폐기했다.
 * 예전 그 느낌의 정본은 `HeroVisual.tsx`(2026-08-10 3차)의 **실제 GPU 유체 풀이**다.
 * 인터랙션 정본은 lusion.co — "휘젓는다"는 왜곡이 아니라 **저은 자국이 남는 것**이다.
 *
 *   이류 → 와도 → 와도 강화 → 발산 → 압력 자코비 20회 → 그래디언트 차감
 *
 * 이 파일은 그 풀이를 `HeroVisual.tsx`에서 상수까지 그대로 옮겨왔다(SIM 128 / DYE 512 /
 * curlStrength 2.2 / 속도 소산 1.6 / 염료 소산 0.85 / splat 반경·세기 / dt 상한 0.0166).
 * 임의로 바꾸지 않는다.
 *
 * 바뀐 것은 **무엇을 미느냐**뿐이다.
 *   HeroVisual : 속도장으로 은하 별 34,900개를 화면 공간에서 민다
 *   여기        : 속도장으로 불꽃(`Wordmark.tsx`의 2단 도메인 워프 fBm) 자체를 민다
 *
 * 색축만 버밀리언 → 딥스페이스/인디고/블루(#1D4ED8)/청백으로 교체했다.
 * 염료는 저은 자국이므로 청백으로 발광시켜 커서가 지나간 자리가 남는다.
 */

const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const ADVECT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uSource;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
uniform float uDt;
uniform float uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + uDissipation * uDt);
}
`

const DIVERGENCE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  vec2 c = texture2D(uVelocity, vUv).xy;
  // 자유 미끄럼 경계 — 벽에서 되튀지 않게 부호를 뒤집는다
  if (vUv.x - uTexel.x < 0.0) l = -c.x;
  if (vUv.x + uTexel.x > 1.0) r = -c.x;
  if (vUv.y - uTexel.y < 0.0) b = -c.y;
  if (vUv.y + uTexel.y > 1.0) t = -c.y;
  gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}
`

const CURL = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float r = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float b = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  gl_FragColor = vec4(0.5 * (r - l - t + b), 0.0, 0.0, 1.0);
}
`

/** 수치 확산으로 죽는 소용돌이를 되살린다. 없으면 저은 자국이 그냥 뭉개진다. */
const VORTICITY = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uCurlStrength;
uniform float uDt;
void main() {
  float l = texture2D(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture2D(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture2D(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float c = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(t) - abs(b), abs(r) - abs(l));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * c;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}
`

const PRESSURE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
void main() {
  float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float d = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);
}
`

const GRADIENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float l = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float r = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float b = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float t = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 vel = texture2D(uVelocity, vUv).xy - vec2(r - l, t - b);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`

const SPLAT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uValue;
uniform vec2 uPoint;
uniform float uRadius;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uValue;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}
`

const CLEAR = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float uValue;
void main() { gl_FragColor = uValue * texture2D(uTarget, vUv); }
`

/**
 * 화면 출력 — `Wordmark.tsx` 불꽃과 같은 2단 도메인 워프 fBm.
 * 다른 점은 샘플 좌표를 **유체 속도장으로 밀어서** 읽는다는 것뿐이다.
 * 그래서 커서로 저으면 무늬 자체가 끌려가고, 손을 떼도 유체가 잦아들 때까지 계속 돈다.
 */
const DISPLAY = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform float uTime;
uniform float uAspect;
uniform float uWarp;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(41.7, 289.1))) * 24634.6345);
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
  // 워드마크 불꽃과 동일하게 4옥타브. 더 올리면 잔털이 생겨 실크가 아니라 노이즈가 된다.
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 vel = texture2D(uVelocity, vUv).xy;
  float dye = texture2D(uDye, vUv).x;

  // 속도장으로 샘플 좌표를 민다 — 여기가 "휘젓는" 실체다
  vec2 uv = vUv + vel * uWarp;

  // 화면상 등방 좌표. uAspect를 곱하지 않으면 무늬가 가로로 눌려 줄무늬가 된다.
  vec2 p = vec2(uv.x * uAspect, uv.y) * 0.62;
  float t = uTime * 0.055;

  // 2단 도메인 워프 — 실크/액체 느낌의 접힘
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(4.3, -t * 0.8)));
  vec2 r = vec2(
    fbm(p + 1.9 * q + vec2(1.7, 9.2) + t * 0.42),
    fbm(p + 1.9 * q + vec2(8.3, 2.8) - t * 0.31)
  );
  float f = fbm(p + 2.4 * r);

  float v = clamp(f * 1.45 + 0.5, 0.0, 1.0);

  // 접힌 면이 겹치는 지점 = 밝은 하이라이트 띠
  float fold = 1.0 - smoothstep(0.0, 0.26, abs(r.x - r.y));

  // ── 색축: 딥스페이스 → 인디고 → 블루(#1D4ED8) → 창백한 청백 ──
  vec3 space  = vec3(0.024, 0.043, 0.086);
  vec3 indigo = vec3(0.055, 0.106, 0.290);
  vec3 blue   = vec3(0.114, 0.306, 0.847);
  vec3 pale   = vec3(0.706, 0.816, 1.000);

  vec3 col = mix(space, indigo, smoothstep(0.02, 0.46, v));
  col = mix(col, blue, smoothstep(0.46, 0.80, v));
  col = mix(col, pale, smoothstep(0.88, 1.0, v) * 0.75);
  col = mix(col, pale, fold * 0.20 * smoothstep(0.42, 0.9, v));

  // 성운 안쪽 어두운 골에만 별을 앉힌다. 밝은 면에 뿌리면 먼지처럼 지저분해진다.
  vec2  cell = floor(p * 190.0);
  float star = step(0.9975, hash1(cell));
  float twinkle = 0.6 + 0.4 * sin(uTime * 1.7 + hash1(cell) * 42.0);
  col += vec3(0.62, 0.74, 1.0) * star * twinkle * (1.0 - smoothstep(0.10, 0.42, v)) * 0.55;

  // 저은 자국 — 염료가 지나간 자리를 청백으로 발광시킨다. 유체를 따라 소용돌이치며 잦아든다.
  col += mix(blue, pale, smoothstep(0.25, 1.6, dye)) * (1.0 - exp(-dye * 1.6)) * 0.55;

  // 하단 비네트. 아래 흰 섹션으로 넘어가는 경계를 부드럽게 만든다.
  col *= 1.0 - smoothstep(0.72, 1.0, vUv.y) * 0.28;

  gl_FragColor = vec4(col, 1.0);
}
`

type GL = WebGL2RenderingContext | WebGLRenderingContext
type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; texel: [number, number] }

function compile(gl: GL, type: number, src: string) {
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

function program(gl: GL, frag: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, QUAD_VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null
  const p = gl.createProgram()
  if (!p) return null
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)!
    uniforms[info.name] = gl.getUniformLocation(p, info.name)
  }
  return { p, uniforms }
}
type Prog = NonNullable<ReturnType<typeof program>>

export default function HeroField({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const opts: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    }
    const gl2 = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null
    const gl: GL | null = gl2 ?? (canvas.getContext('webgl', opts) as WebGLRenderingContext | null)
    if (!gl) {
      host.dataset.fallback = 'true'
      return
    }

    // 유체는 부동소수 렌더 타깃이 필요하다. 없으면 CSS 배경(네이비)만 남기고 조용히 빠진다.
    let internal: number
    let type: number
    if (gl2) {
      if (
        !gl2.getExtension('EXT_color_buffer_float') &&
        !gl2.getExtension('EXT_color_buffer_half_float')
      ) {
        host.dataset.fallback = 'true'
        return
      }
      internal = gl2.RGBA16F
      type = gl2.HALF_FLOAT
    } else {
      const g1 = gl as WebGLRenderingContext
      const half = g1.getExtension('OES_texture_half_float')
      if (
        !half ||
        !g1.getExtension('OES_texture_half_float_linear') ||
        !g1.getExtension('EXT_color_buffer_half_float')
      ) {
        host.dataset.fallback = 'true'
        return
      }
      internal = gl.RGBA
      type = half.HALF_FLOAT_OES
    }

    const progs = {
      advect: program(gl, ADVECT),
      divergence: program(gl, DIVERGENCE),
      curl: program(gl, CURL),
      vorticity: program(gl, VORTICITY),
      pressure: program(gl, PRESSURE),
      gradient: program(gl, GRADIENT),
      splat: program(gl, SPLAT),
      clear: program(gl, CLEAR),
      display: program(gl, DISPLAY),
    }
    if (Object.values(progs).some((x) => !x)) {
      host.dataset.fallback = 'true'
      return
    }
    const P = progs as Record<keyof typeof progs, Prog>

    const quad = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const created: (WebGLTexture | WebGLFramebuffer)[] = []

    function makeFBO(w: number, h: number): FBO {
      const tex = gl!.createTexture()!
      gl!.bindTexture(gl!.TEXTURE_2D, tex)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internal, w, h, 0, gl!.RGBA, type, null)
      const fbo = gl!.createFramebuffer()!
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0)
      gl!.viewport(0, 0, w, h)
      gl!.clearColor(0, 0, 0, 1)
      gl!.clear(gl!.COLOR_BUFFER_BIT)
      created.push(tex, fbo)
      return { tex, fbo, w, h, texel: [1 / w, 1 / h] }
    }

    function makeDouble(w: number, h: number) {
      let a = makeFBO(w, h)
      let b = makeFBO(w, h)
      return {
        get read() {
          return a
        },
        get write() {
          return b
        },
        get texel() {
          return a.texel
        },
        swap() {
          const t = a
          a = b
          b = t
        },
      }
    }

    /* HeroVisual.tsx와 같은 해상도. 시뮬은 128에서 풀어도 소용돌이가 충분히 굵게 나온다. */
    const SIM = 128
    const DYE = 512
    const velocity = makeDouble(SIM, SIM)
    const dye = makeDouble(DYE, DYE)
    const divergence = makeFBO(SIM, SIM)
    const curl = makeFBO(SIM, SIM)
    const pressure = makeDouble(SIM, SIM)

    function useQuad() {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
      gl!.enableVertexAttribArray(0)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
    }

    function blit(target: FBO | null) {
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo)
        gl!.viewport(0, 0, target.w, target.h)
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null)
        gl!.viewport(0, 0, canvas!.width, canvas!.height)
      }
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
    }

    function bind(tex: WebGLTexture, unit: number) {
      gl!.activeTexture(gl!.TEXTURE0 + unit)
      gl!.bindTexture(gl!.TEXTURE_2D, tex)
      return unit
    }

    // ── 커서 ────────────────────────────────────────────────
    type Splat = { x: number; y: number; dx: number; dy: number }
    const queue: Splat[] = []
    let lastX = 0
    let lastY = 0
    let hasLast = false

    function onPointer(e: PointerEvent) {
      const rect = host!.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      // WebGL은 아래가 0이다. 화면 좌표를 뒤집어야 커서와 소용돌이가 같은 곳에 있다.
      const y = 1 - (e.clientY - rect.top) / rect.height
      if (hasLast) {
        const dx = (x - lastX) * rect.width
        const dy = (y - lastY) * rect.height
        if (dx * dx + dy * dy > 0.01) queue.push({ x, y, dx, dy })
      }
      lastX = x
      lastY = y
      hasLast = true
    }
    const onLeave = () => {
      hasLast = false
    }

    /* 히어로 카피가 화면 한가운데를 덮고 있다. 커서 이벤트를 window에서 받아야
       글자 위를 지날 때 유체가 끊기지 않는다(pointer-events는 CSS에서 이미 통과시켰다). */
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    host.addEventListener('pointerleave', onLeave)

    function applySplats(aspect: number) {
      if (!queue.length) return
      const batch = queue.splice(0, Math.min(queue.length, 12))
      gl!.useProgram(P.splat.p)
      for (const s of batch) {
        gl!.uniform1i(P.splat.uniforms.uTarget, bind(velocity.read.tex, 0))
        gl!.uniform1f(P.splat.uniforms.uAspect, aspect)
        gl!.uniform2f(P.splat.uniforms.uPoint, s.x, s.y)
        gl!.uniform1f(P.splat.uniforms.uRadius, 0.00018)
        gl!.uniform3f(P.splat.uniforms.uValue, s.dx * 5.2, s.dy * 5.2, 0)
        blit(velocity.write)
        velocity.swap()

        gl!.uniform1i(P.splat.uniforms.uTarget, bind(dye.read.tex, 0))
        gl!.uniform1f(P.splat.uniforms.uRadius, 0.00013)
        gl!.uniform3f(P.splat.uniforms.uValue, 0.55, 0, 0)
        blit(dye.write)
        dye.swap()
      }
      queue.length = 0
    }

    function step(dt: number, aspect: number) {
      useQuad()

      gl!.useProgram(P.curl.p)
      gl!.uniform2f(P.curl.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.curl.uniforms.uVelocity, bind(velocity.read.tex, 0))
      blit(curl)

      gl!.useProgram(P.vorticity.p)
      gl!.uniform2f(P.vorticity.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.vorticity.uniforms.uVelocity, bind(velocity.read.tex, 0))
      gl!.uniform1i(P.vorticity.uniforms.uCurl, bind(curl.tex, 1))
      // 2026-08-10 실측: 26이면 와도 강화가 감쇠보다 커서 속도장이 영영 안 죽는다. 잦아들 만큼만.
      gl!.uniform1f(P.vorticity.uniforms.uCurlStrength, 2.2)
      gl!.uniform1f(P.vorticity.uniforms.uDt, dt)
      blit(velocity.write)
      velocity.swap()

      gl!.useProgram(P.divergence.p)
      gl!.uniform2f(P.divergence.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.divergence.uniforms.uVelocity, bind(velocity.read.tex, 0))
      blit(divergence)

      gl!.useProgram(P.clear.p)
      gl!.uniform1i(P.clear.uniforms.uTarget, bind(pressure.read.tex, 0))
      gl!.uniform1f(P.clear.uniforms.uValue, 0.8)
      blit(pressure.write)
      pressure.swap()

      gl!.useProgram(P.pressure.p)
      gl!.uniform2f(P.pressure.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.pressure.uniforms.uDivergence, bind(divergence.tex, 0))
      for (let i = 0; i < 20; i++) {
        gl!.uniform1i(P.pressure.uniforms.uPressure, bind(pressure.read.tex, 1))
        blit(pressure.write)
        pressure.swap()
      }

      gl!.useProgram(P.gradient.p)
      gl!.uniform2f(P.gradient.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.gradient.uniforms.uPressure, bind(pressure.read.tex, 0))
      gl!.uniform1i(P.gradient.uniforms.uVelocity, bind(velocity.read.tex, 1))
      blit(velocity.write)
      velocity.swap()

      gl!.useProgram(P.advect.p)
      gl!.uniform2f(P.advect.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1f(P.advect.uniforms.uDt, dt)
      gl!.uniform1i(P.advect.uniforms.uVelocity, bind(velocity.read.tex, 0))
      gl!.uniform1i(P.advect.uniforms.uSource, bind(velocity.read.tex, 0))
      gl!.uniform1f(P.advect.uniforms.uDissipation, 1.6)
      blit(velocity.write)
      velocity.swap()

      gl!.uniform1i(P.advect.uniforms.uVelocity, bind(velocity.read.tex, 0))
      gl!.uniform1i(P.advect.uniforms.uSource, bind(dye.read.tex, 1))
      gl!.uniform1f(P.advect.uniforms.uDissipation, 0.85)
      blit(dye.write)
      dye.swap()

      applySplats(aspect)
    }

    let disposed = false
    let raf = 0
    let visible = true
    let last = performance.now()
    const start = performance.now()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    /* 풀스크린 fBm은 픽셀당 비용이 크다. DPR을 그대로 쓰면 4K에서 프레임이 무너진다.
       0.72배로 렌더하고 CSS가 늘린다 — 유체는 저주파라 확대해도 뭉개진 게 안 보인다. */
    const RENDER_SCALE = 0.72

    function resize() {
      const w = host!.clientWidth
      const h = host!.clientHeight
      if (!w || !h) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE
      const pw = Math.max(1, Math.round(w * dpr))
      const ph = Math.max(1, Math.round(h * dpr))
      if (canvas!.width !== pw || canvas!.height !== ph) {
        canvas!.width = pw
        canvas!.height = ph
      }
      return true
    }

    function render(now: number) {
      const aspect = canvas!.width / canvas!.height

      // 탭 복귀 등으로 dt가 크게 튀면 시뮬이 폭발한다. 상한을 건다.
      const dt = Math.min((now - last) / 1000, 0.0166)
      if (!reduced.matches) step(dt, aspect)
      last = now

      useQuad()
      gl!.useProgram(P.display.p)
      gl!.uniform1i(P.display.uniforms.uVelocity, bind(velocity.read.tex, 0))
      gl!.uniform1i(P.display.uniforms.uDye, bind(dye.read.tex, 1))
      gl!.uniform1f(P.display.uniforms.uTime, reduced.matches ? 12 : (now - start) / 1000)
      gl!.uniform1f(P.display.uniforms.uAspect, aspect)
      // 속도장이 무늬를 미는 세기. 올리면 저을 때 결이 더 멀리 끌려간다.
      gl!.uniform1f(P.display.uniforms.uWarp, 0.0016)
      blit(null)
    }

    function loop(now: number) {
      if (disposed) return
      render(now)
      raf = requestAnimationFrame(loop)
    }
    function play() {
      if (disposed || raf || reduced.matches) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    function pause() {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    function refresh() {
      if (!resize()) return
      if (reduced.matches || !visible) {
        pause()
        render(performance.now())
      } else {
        play()
      }
    }

    refresh()

    const ro = new ResizeObserver(() => refresh())
    ro.observe(host)

    // 화면 밖이면 렌더 루프를 멈춘다 — 스크롤해서 지나간 뒤에도 GPU를 물고 있으면 안 된다
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
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      host.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onReducedChange)
      for (const obj of created) {
        if (gl.isTexture(obj as WebGLTexture)) gl.deleteTexture(obj as WebGLTexture)
        else gl.deleteFramebuffer(obj as WebGLFramebuffer)
      }
      gl.deleteBuffer(quad)
      for (const pr of Object.values(P)) gl.deleteProgram(pr.p)
    }
  }, [])

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
