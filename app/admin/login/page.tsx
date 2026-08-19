import { login } from '../actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B1322',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <form
        action={login}
        style={{
          width: 320,
          padding: 32,
          borderRadius: 16,
          background: '#111B2E',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 18, marginBottom: 20 }}>TOMOB AX 관리자</h1>
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: '#0B1322',
            color: '#fff',
            fontSize: 15,
            marginBottom: 12,
          }}
        />
        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>
            비밀번호가 올바르지 않습니다.
          </p>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: 'none',
            background: '#1D4ED8',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          로그인
        </button>
      </form>
    </main>
  )
}
