/**
 * `/ax` 자가진단 결과 접수 — 2026-08-13 신설.
 *
 * 받은 리드를 TOMOB Ax 텔레그램 그룹으로 즉시 보낸다.
 * 두 사람이 같은 화면을 보고 바로 대응하기 위해서이고, 동시에 동의 기록이 된다.
 * 정보통신망법상 광고성 정보 수신 동의는 분쟁 시 입증책임이 발송자에게 있어
 * 동의 일시·경로·항목이 남아야 한다. 그래서 동의 안 함도 그대로 적는다.
 *
 * ⚠️ 텔레그램 메시지는 임시 기록이다. 발송량이 늘면 별도 저장소로 옮겨야 한다.
 *
 * 환경변수: TELEGRAM_BOT_TOKEN · TELEGRAM_CHAT_ID (Vercel 프로젝트 설정)
 */

export const runtime = 'nodejs'

type Payload = {
  checked?: unknown
  total?: unknown
  company?: unknown
  email?: unknown
  phone?: unknown
  consent?: unknown
}

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

function buildMessage(body: Payload) {
  const checked = Array.isArray(body.checked)
    ? body.checked.filter((item): item is string => typeof item === 'string').slice(0, 20)
    : []
  const total = typeof body.total === 'number' ? body.total : checked.length
  const company = text(body.company, 80)
  const email = text(body.email, 160)
  const phone = text(body.phone, 40)
  const consent = body.consent === true

  const stamp = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const lines = [
    '[TOMOB AX] 자가진단 접수',
    '',
    `회사: ${company || '적지 않음'}`,
    `이메일: ${email || '적지 않음'}`,
    `연락처: ${phone || '적지 않음'}`,
    '',
    `해당 항목 ${checked.length}/${total}`,
    ...checked.map((item) => `  ${item}`),
    '',
    consent
      ? `광고성 정보 수신 동의: 동의 · ${stamp} · /ax 자가진단`
      : '광고성 정보 수신 동의: 동의하지 않음 (문자 발송 금지)',
  ]

  return lines.join('\n').slice(0, 4096)
}

export async function POST(request: Request) {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return Response.json({ ok: false, error: 'bad request' }, { status: 400 })
  }

  const email = text(body.email, 160)
  if (!email.includes('@')) {
    return Response.json({ ok: false, error: 'email required' }, { status: 400 })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    // 설정이 빠졌을 때 방문자에게 성공했다고 말하면 리드가 조용히 사라진다.
    console.error('paincheck: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing')
    return Response.json({ ok: false, error: 'not configured' }, { status: 500 })
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(body),
      disable_web_page_preview: true,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error(`paincheck: telegram failed ${response.status} ${detail}`)
    return Response.json({ ok: false, error: 'send failed' }, { status: 502 })
  }

  return Response.json({ ok: true })
}
