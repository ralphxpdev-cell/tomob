'use client'

import { useEffect, useRef } from 'react'

/**
 * 히어로 워드마크 바로 아래 풀블리드 비주얼.
 *
 * 이력
 *  - 2026-08-07 릴 8장(AI 생성 3D 기기 목업) → 사령관 "AI가 만든 것 같다"로 폐기
 *  - 2026-08-10 1차: 워드마크와 같은 fBm 단일 레이어 → "불꽃 같다" + "가로만 길다"로 반려
 *  - 2026-08-10 2차: 절차 생성 성운 + 별 + 유체 → 배경을 스타딜리버리 은하로 교체하라는 지시
 *  - 2026-08-10 3차(현재): **스타딜리버리 은하 정본 이식 + 커서로 휘젓는 GPU 유체**
 *
 * 배경 정본: `project/starlight-delivery/prototypes/game.html`의 `createGalaxy`.
 * 생성 파라미터(count 34900 / radius 10.5 / branches 4 / spin -0.3 / randomness 0.77 /
 * randomnessPower 2 / inside #c7bfdf / outside #e651e1)와 가산합성·sizeAttenuation을
 * 그대로 옮겼다. 임의로 바꾸지 않는다. 흰 별밭(createStarfield)은 2026-07-21 사령관 지시로
 * 그 게임에서 이미 제거됐으므로 여기에도 넣지 않는다.
 * 프레이밍(카메라 거리·오프셋)만 1440x900 띠에 맞게 잡는다.
 *
 * 인터랙션 정본: lusion.co (사령관 지정). "휘젓는다"는 왜곡이 아니라 저은 자국이 남는 것이므로
 * 가짜 변위가 아니라 실제 GPU 유체 풀이로 푼다.
 *   속도장 이류 → 와도 → 와도 강화 → 발산 → 압력 자코비 → 그래디언트 차감
 * 그 속도장으로 은하의 **별 하나하나를 화면 공간에서 밀고**, 염료가 지나간 자리의 별을 밝힌다.
 * 별이 실제로 밀려나므로 저은 자국이 은하 자체에 남는다.
 *
 * 합성은 half-float 씬 버퍼에 선형으로 누적한 뒤 마지막에 한 번만 sRGB로 인코딩한다.
 * (three.js의 가산합성 결과와 같은 순서. 인코딩 후 블렌딩하면 색이 뜬다.)
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
 * 은하 별 — 정본 `createGalaxy`의 PointsMaterial(size 0.11, sizeAttenuation) 그대로.
 * three의 sizeAttenuation은 gl_PointSize = size * (viewportHeight/2) / -mvz 다.
 * 여기에 유체 속도장으로 화면 공간 변위와 염료 발광을 더한다.
 */
const GALAXY_VERT = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aColor;
uniform mat4 uModelView;
uniform mat4 uProjection;
uniform sampler2D uVelocity;
uniform float uPointSize;
uniform float uHeightScale;
uniform float uWarp;
uniform vec2 uAspect;
varying vec3 vColor;
void main() {
  vec4 mv = uModelView * vec4(aPosition, 1.0);
  vec4 clip = uProjection * mv;

  // 화면 좌표를 알아야 속도장을 읽을 수 있으므로 투영 뒤에 민다.
  vec2 uv = (clip.xy / clip.w) * 0.5 + 0.5;
  vec2 vel = texture2DLod(uVelocity, uv, 0.0).xy;

  clip.xy += vel * uWarp * uAspect * clip.w;
  gl_Position = clip;

  // three points_vert: gl_PointSize = size * (scale / -mvPosition.z), scale = drawingBufferHeight/2
  gl_PointSize = max(uPointSize * (uHeightScale / max(-mv.z, 0.0001)), 1.0);
  vColor = aColor;
}
`

/**
 * 정본 createGalaxy의 PointsMaterial에는 `map`이 없다.
 * three는 map 없는 Points를 gl_PointCoord 감쇠 없이 납작한 사각 점으로 그린다.
 * 방사형 falloff를 넣으면 모양도 밝기도 정본과 달라진다 — 넣지 않는다.
 * 색도 정점 색 그대로 두고 임의 배율을 곱하지 않는다. 밝기 조절은 톤매핑이 한다.
 */
const GALAXY_FRAG = `
precision highp float;
varying vec3 vColor;
uniform float uOpacity;
void main() {
  // 정본 material.opacity(가산합성이라 색에 그대로 곱해진다)
  gl_FragColor = vec4(vColor * uOpacity, 1.0);
}
`

/**
 * 저은 자국 — 무작위 점을 미는 것만으로는 사람 눈이 차이를 못 읽는다.
 * 염료를 은하 자신의 색(안쪽 #c7bfdf → 바깥 #e651e1)으로 발광시켜,
 * 커서가 지나간 자리에 은하의 빛이 번지고 소용돌이치게 만든다.
 */
const DYEGLOW = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uDye;
uniform vec3 uInner;
uniform vec3 uOuter;
uniform float uIntensity;
void main() {
  float d = texture2D(uDye, vUv).x;
  if (d < 0.002) discard;
  // 옅은 자락은 바깥 색(마젠타), 진한 심지는 안쪽 색(라벤더 화이트)으로 간다
  vec3 c = mix(uOuter, uInner, smoothstep(0.25, 1.6, d));
  gl_FragColor = vec4(c * (1.0 - exp(-d * 1.6)) * uIntensity, 1.0);
}
`

const BACKDROP = `
precision highp float;
varying vec2 vUv;
uniform vec3 uVoid;
void main() { gl_FragColor = vec4(uVoid, 1.0); }
`

/**
 * 정본 렌더러 설정을 그대로 재현한다.
 *   renderer.toneMapping = ACESFilmicToneMapping / toneMappingExposure = 1.0 (three 0.185.1)
 *   outputColorSpace = sRGB
 * ACES를 빼면 하이라이트가 롤오프되지 않아 색이 뜬다. 아래 식은 three tonemapping_pars_fragment 그대로.
 */
const COMPOSITE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform float uExposure;

vec3 RRTAndODTFit(vec3 v) {
  vec3 a = v * (v + 0.0245786) - 0.000090537;
  vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
  return a / b;
}
vec3 acesFilmic(vec3 color) {
  const mat3 ACESInputMat = mat3(
    0.59719, 0.07600, 0.02840,
    0.35458, 0.90834, 0.13383,
    0.04823, 0.01566, 0.83777
  );
  const mat3 ACESOutputMat = mat3(
     1.60475, -0.10208, -0.00327,
    -0.53108,  1.10813, -0.07276,
    -0.07367, -0.00605,  1.07602
  );
  color *= uExposure / 0.6;
  color = ACESInputMat * color;
  color = RRTAndODTFit(color);
  color = ACESOutputMat * color;
  return clamp(color, 0.0, 1.0);
}

void main() {
  vec3 c = texture2D(uScene, vUv).rgb;

  c = acesFilmic(max(c, vec3(0.0)));

  // 톤매핑된 선형값을 여기서 한 번만 sRGB로 인코딩한다
  c = mix(12.92 * c, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));

  // 상하 끝을 눌러 흰 배경과 만나는 경계를 정리한다
  float edge = smoothstep(0.0, 0.11, vUv.y) * smoothstep(0.0, 0.11, 1.0 - vUv.y);
  c *= 0.34 + 0.66 * edge;

  // 넓은 어두운 면의 8bit 밴딩 제거용 디더. 1/255 진폭이라 grain으로 보이지 않는다.
  float d = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  c += (d - 0.5) / 255.0;

  gl_FragColor = vec4(c, 1.0);
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

function program(gl: GL, frag: string, vert = QUAD_VERT, attribs: string[] = ['aPos']) {
  const vs = compile(gl, gl.VERTEX_SHADER, vert)
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null
  const p = gl.createProgram()
  if (!p) return null
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  attribs.forEach((name, i) => gl.bindAttribLocation(p, i, name))
  gl.linkProgram(p)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < n; i++) uniforms[gl.getActiveUniform(p, i)!.name] = gl.getUniformLocation(p, gl.getActiveUniform(p, i)!.name)
  return { p, uniforms }
}
type Prog = NonNullable<ReturnType<typeof program>>

// ── 행렬 (열 우선) ────────────────────────────────────────
function perspective(fovDeg: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0,
  ])
}

/**
 * 정본의 galaxy 회전(오일러 XYZ) + scale + 카메라 상대 위치를 하나의 모델뷰로 합친다.
 * 회전 성분은 three Matrix4.makeRotationFromEuler의 'XYZ' 분기 식을 그대로 옮긴 것이다.
 * 전치해서 넣으면 회전 순서가 뒤집혀 기울기가 달라진다.
 */
const mvOut = new Float32Array(16)
function modelView(rotX: number, rotY: number, rotZ: number, scale: number, tx: number, ty: number, tz: number) {
  const a = Math.cos(rotX), b = Math.sin(rotX)
  const c = Math.cos(rotY), d = Math.sin(rotY)
  const e = Math.cos(rotZ), f = Math.sin(rotZ)
  const ae = a * e, af = a * f, be = b * e, bf = b * f
  mvOut[0] = c * e * scale
  mvOut[1] = (af + be * d) * scale
  mvOut[2] = (bf - ae * d) * scale
  mvOut[3] = 0
  mvOut[4] = -c * f * scale
  mvOut[5] = (ae - bf * d) * scale
  mvOut[6] = (be + af * d) * scale
  mvOut[7] = 0
  mvOut[8] = d * scale
  mvOut[9] = -b * c * scale
  mvOut[10] = a * c * scale
  mvOut[11] = 0
  mvOut[12] = tx
  mvOut[13] = ty
  mvOut[14] = tz
  mvOut[15] = 1
  return mvOut
}

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255),
  ]
}

export default function HeroVisual({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const opts: WebGLContextAttributes = { alpha: false, antialias: false, depth: false, stencil: false }
    const gl2 = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null
    const gl: GL | null = gl2 ?? (canvas.getContext('webgl', opts) as WebGLRenderingContext | null)
    if (!gl) {
      host.dataset.fallback = 'true'
      return
    }

    // 유체와 선형 누적 둘 다 부동소수 렌더 타깃이 필요하다. 없으면 CSS 폴백으로 내려간다.
    let internal: number
    let type: number
    if (gl2) {
      if (!gl2.getExtension('EXT_color_buffer_float') && !gl2.getExtension('EXT_color_buffer_half_float')) {
        host.dataset.fallback = 'true'
        return
      }
      internal = gl2.RGBA16F
      type = gl2.HALF_FLOAT
    } else {
      const g1 = gl as WebGLRenderingContext
      const half = g1.getExtension('OES_texture_half_float')
      if (!half || !g1.getExtension('OES_texture_half_float_linear') || !g1.getExtension('EXT_color_buffer_half_float')) {
        host.dataset.fallback = 'true'
        return
      }
      internal = gl.RGBA
      type = half.HALF_FLOAT_OES
    }

    // 정점 셰이더에서 속도장을 읽어야 별을 민다. 못 읽는 환경이면 폴백.
    if ((gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) as number) < 2) {
      host.dataset.fallback = 'true'
      return
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
      backdrop: program(gl, BACKDROP),
      dyeglow: program(gl, DYEGLOW),
      composite: program(gl, COMPOSITE),
      galaxy: program(gl, GALAXY_FRAG, GALAXY_VERT, ['aPosition', 'aColor']),
    }
    if (Object.values(progs).some((x) => !x)) {
      host.dataset.fallback = 'true'
      return
    }
    const P = progs as Record<keyof typeof progs, Prog>

    // ── 은하 정본 생성 ──────────────────────────────────────
    // project/starlight-delivery/prototypes/game.html createGalaxy 와 동일한 식.
    // 모바일 점 개수 감소도 그 파일의 GAL_TOUCH_COUNT 규칙(사령관 2026-07-23)을 따른다.
    const coarse = window.matchMedia('(pointer:coarse)').matches
    const COUNT = coarse ? 18000 : 34900
    const RADIUS = 10.5
    const BRANCHES = 4
    const SPIN = -0.3
    const RANDOMNESS = 0.77
    const RANDOMNESS_POWER = 2
    const cIn = hexToLinear('#c7bfdf')
    const cOut = hexToLinear('#e651e1')

    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const r = Math.random() * RADIUS
      const spinAngle = r * SPIN
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2
      const rx = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r
      const ry = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r
      const rz = Math.pow(Math.random(), RANDOMNESS_POWER) * (Math.random() < 0.5 ? 1 : -1) * RANDOMNESS * r
      positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx
      positions[i3 + 1] = ry
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz
      const t = r / RADIUS
      colors[i3] = cIn[0] + (cOut[0] - cIn[0]) * t
      colors[i3 + 1] = cIn[1] + (cOut[1] - cIn[1]) * t
      colors[i3 + 2] = cIn[2] + (cOut[2] - cIn[2]) * t
    }

    const posBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    const colBuf = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf)
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

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
        get read() { return a },
        get write() { return b },
        get texel() { return a.texel },
        swap() { const t = a; a = b; b = t },
      }
    }

    /** 시뮬은 128에서 푼다. 1440폭에서도 소용돌이가 충분히 굵게 나온다. */
    const SIM = 128
    const DYE = 512
    const velocity = makeDouble(SIM, SIM)
    const dye = makeDouble(DYE, DYE)
    const divergence = makeFBO(SIM, SIM)
    const curl = makeFBO(SIM, SIM)
    const pressure = makeDouble(SIM, SIM)
    let scene = makeFBO(2, 2)

    function useQuad() {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad)
      gl!.enableVertexAttribArray(0)
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0)
      gl!.disableVertexAttribArray(1)
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
    const onLeave = () => { hasLast = false }

    host.addEventListener('pointermove', onPointer)
    host.addEventListener('pointerdown', onPointer)
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
      gl!.disable(gl!.BLEND)
      useQuad()

      gl!.useProgram(P.curl.p)
      gl!.uniform2f(P.curl.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.curl.uniforms.uVelocity, bind(velocity.read.tex, 0))
      blit(curl)

      gl!.useProgram(P.vorticity.p)
      gl!.uniform2f(P.vorticity.uniforms.uTexel, velocity.texel[0], velocity.texel[1])
      gl!.uniform1i(P.vorticity.uniforms.uVelocity, bind(velocity.read.tex, 0))
      gl!.uniform1i(P.vorticity.uniforms.uCurl, bind(curl.tex, 1))
      // 2026-08-10: 26이면 와도 강화가 넣는 에너지가 감쇠보다 커서 속도장이 죽지 않는다.
      // 저은 뒤 15초가 지나도 프레임 차이가 안 줄어 별이 영구히 흔들렸다(실측). 잦아들 만큼만 넣는다.
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

    // ── 프레이밍 ────────────────────────────────────────────
    // 정본에서 은하 배치는 `galaxy.position.set(...)` 초기값이 아니라 렌더 루프의 INTRO 분기가
    // 매 프레임 덮어쓴다. 대조 기준으로 쓴 게임 메뉴 화면(assets/starlight/menu.png)이 그 상태다.
    //   GAL_DEF = { scale:11.5, dist:175, x:-40, y:30, opa:1, size:0.09, tilt:55, spin:0.06 }
    //   position = camera + forward*(dist*2.1) , x += gal.x*1.6 , y += gal.y*1.6
    //   rotation.x = 78° (거의 edge-on), rotation.z = 0.62
    //   rotation.y += dt * 0.06  ← 계속 돈다
    // 정본 주석: "레퍼런스는 화면을 가로지르는 띠다 — 멀리 밀어야 띠로 읽힌다."
    // 카메라 forward는 INTRO에서 -Z이므로 모델뷰 이동은 아래와 같이 정리된다.
    const GAL_SCALE = 11.5
    const GAL_SIZE = 0.09
    const GAL_SPIN = 0.06
    const ROT_X = (78 * Math.PI) / 180
    const ROT_Z = 0.62
    const TX = -40 * 1.6
    const TY = 30 * 1.6
    const TZ = -175 * 2.1
    // 정본 material.opacity = gal.opa * GAL_TOUCH_DIM (터치에서만 0.5로 감광, 사령관 2026-07-23)
    const GAL_OPACITY = coarse ? 0.5 : 1.0

    let disposed = false
    let raf = 0
    let visible = true
    let last = performance.now()
    /** 정본과 같이 dt를 누적해서 Y축으로 계속 돈다 (galaxy.rotation.y += dt * spin) */
    let spinY = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    function resize() {
      const w = host!.clientWidth
      const h = host!.clientHeight
      if (!w || !h) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const pw = Math.round(w * dpr)
      const ph = Math.round(h * dpr)
      if (canvas!.width !== pw || canvas!.height !== ph) {
        canvas!.width = pw
        canvas!.height = ph
        if (scene.w !== pw || scene.h !== ph) scene = makeFBO(pw, ph)
      }
      return true
    }

    function render(now: number) {
      const aspect = canvas!.width / canvas!.height

      // 탭 복귀 등으로 dt가 크게 튀면 시뮬이 폭발한다. 상한을 건다.
      const dt = Math.min((now - last) / 1000, 0.0166)
      if (!reduced.matches) {
        step(dt, aspect)
        spinY += dt * GAL_SPIN
      }
      last = now

      // 1) 심우주 바탕을 선형 버퍼에 깐다
      gl!.disable(gl!.BLEND)
      useQuad()
      gl!.useProgram(P.backdrop.p)
      // 정본 scene.background = 0x000000
      gl!.uniform3f(P.backdrop.uniforms.uVoid, 0, 0, 0)
      blit(scene)

      // 2) 은하를 가산합성으로 누적한다 (정본 blending: AdditiveBlending, depthWrite false)
      gl!.enable(gl!.BLEND)
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE)
      gl!.useProgram(P.galaxy.p)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuf)
      gl!.enableVertexAttribArray(0)
      gl!.vertexAttribPointer(0, 3, gl!.FLOAT, false, 0, 0)
      gl!.bindBuffer(gl!.ARRAY_BUFFER, colBuf)
      gl!.enableVertexAttribArray(1)
      gl!.vertexAttribPointer(1, 3, gl!.FLOAT, false, 0, 0)
      gl!.uniformMatrix4fv(
        P.galaxy.uniforms.uModelView,
        false,
        modelView(ROT_X, spinY, ROT_Z, GAL_SCALE, TX, TY, TZ)
      )
      gl!.uniformMatrix4fv(P.galaxy.uniforms.uProjection, false, perspective(52, aspect, 0.5, 40000))
      gl!.uniform1i(P.galaxy.uniforms.uVelocity, bind(velocity.read.tex, 0))
      // 정본 applyGal: material.size = gal.size = 0.09 (createGalaxy 기본 0.11을 덮어쓴다)
      gl!.uniform1f(P.galaxy.uniforms.uPointSize, GAL_SIZE)
      gl!.uniform1f(P.galaxy.uniforms.uOpacity, GAL_OPACITY)
      gl!.uniform1f(P.galaxy.uniforms.uHeightScale, canvas!.height / 2)
      gl!.uniform1f(P.galaxy.uniforms.uWarp, 0.0011)
      gl!.uniform2f(P.galaxy.uniforms.uAspect, 1.0, aspect)
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, scene.fbo)
      gl!.viewport(0, 0, scene.w, scene.h)
      gl!.drawArrays(gl!.POINTS, 0, COUNT)
      gl!.disableVertexAttribArray(1)

      // 3) 저은 자국을 은하 자신의 색으로 발광시켜 같은 버퍼에 더한다
      useQuad()
      gl!.blendFunc(gl!.ONE, gl!.ONE)
      gl!.useProgram(P.dyeglow.p)
      gl!.uniform1i(P.dyeglow.uniforms.uDye, bind(dye.read.tex, 0))
      gl!.uniform3f(P.dyeglow.uniforms.uInner, cIn[0], cIn[1], cIn[2])
      gl!.uniform3f(P.dyeglow.uniforms.uOuter, cOut[0], cOut[1], cOut[2])
      gl!.uniform1f(P.dyeglow.uniforms.uIntensity, 0.62)
      blit(scene)
      gl!.disable(gl!.BLEND)

      // 4) 선형 누적을 sRGB로 한 번만 인코딩해 화면에 낸다
      useQuad()
      gl!.useProgram(P.composite.p)
      gl!.uniform1i(P.composite.uniforms.uScene, bind(scene.tex, 0))
      gl!.uniform1f(P.composite.uniforms.uExposure, 1.0)
      blit(null)
    }

    function loop(now: number) {
      if (disposed) return
      render(now)
      raf = requestAnimationFrame(loop)
    }
    function play() {
      if (disposed || raf) return
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
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerdown', onPointer)
      host.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onReducedChange)
      for (const obj of created) {
        if (gl.isTexture(obj as WebGLTexture)) gl.deleteTexture(obj as WebGLTexture)
        else gl.deleteFramebuffer(obj as WebGLFramebuffer)
      }
      gl.deleteBuffer(quad)
      gl.deleteBuffer(posBuf)
      gl.deleteBuffer(colBuf)
      for (const pr of Object.values(P)) gl.deleteProgram(pr.p)
    }
  }, [])

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
