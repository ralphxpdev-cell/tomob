// 서버 전용 Supabase 클라이언트. tomob-seed와 같은 Supabase 프로젝트(xynizezgdggiluzxufem)를
// DB로만 재사용한다 — tomob-seed의 웹사이트·서버 코드에는 의존하지 않는다.
// service_role 키라 절대 클라이언트 번들에 들어가면 안 된다 — API 라우트에서만 import한다.
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
