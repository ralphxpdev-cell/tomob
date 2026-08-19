'use client'

// /admin 목록 UI.
//
// 시각 톤 결정(2026-08-14, 정정): tomob-studio 자체 화이트 SaaS 블루 톤(/ax와 같은 토큰 —
// page.module.css)을 그대로 쓴다. 처음에 tomob-seed의 다크 "Mission Control" 콘솔을 그대로
// 이식했으나 사령관 지시로 되돌린다. 목록은 실제 `<table>`로 짜서(이전 div 스택형은 컬럼이
// 안 맞아 "제품 대시보드 같지 않다"는 지적을 받았다) 행·열이 맞춰지고 스캔하기 쉽게 만든다.
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import styles from './admin.module.css'
import { logout, type Lead } from './actions'
import { LEAD_STATUS_LABEL, type LeadStatus } from './lead-status'

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function isThisWeek(iso: string) {
  const d = new Date(iso).getTime()
  return Date.now() - d < 7 * 24 * 60 * 60 * 1000
}

export function AdminList({ rows }: { rows: Lead[] }) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [q, setQ] = useState('')

  const summary = useMemo(
    () => ({
      total: rows.length,
      thisWeek: rows.filter((r) => isThisWeek(r.created_at)).length,
      consented: rows.filter((r) => r.consent).length,
      highSignal: rows.filter((r) => (r.checked_items?.length ?? 0) >= 3).length,
    }),
    [rows],
  )

  const cards = [
    { key: 'total', label: '전체 신청', sub: 'TOTAL', value: summary.total, glow: false },
    { key: 'week', label: '이번 주', sub: 'THIS WEEK', value: summary.thisWeek, glow: true },
    { key: 'consent', label: '수신 동의', sub: 'CONSENTED', value: summary.consented, glow: false },
    { key: 'signal', label: '체크 3개 이상', sub: 'HIGH SIGNAL', value: summary.highSignal, glow: true },
  ]

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (q.trim()) {
        const needle = q.trim().toLowerCase()
        const hay = `${r.company ?? ''} ${r.email} ${r.phone ?? ''}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [rows, statusFilter, q])

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>
              <span className={styles.kickerDot} />
              TOMOB AX
            </p>
            <h1 className={styles.title}>
              업무점검 신청
              <span className={styles.titleCount}>{rows.length}건</span>
            </h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.badge}>Admin</span>
            <form action={logout}>
              <button type="submit" className={styles.logoutBtn}>
                로그아웃
              </button>
            </form>
          </div>
        </header>

        <div className={styles.cards}>
          {cards.map((c) => (
            <div key={c.key} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={`${styles.cardDot} ${c.glow ? styles.cardDotGlow : ''}`} />
                <span className={styles.cardLabel}>{c.label}</span>
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.cardValue}>{c.value}</span>
                <span className={styles.cardSub}>{c.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M14 14l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="회사명 · 이메일 · 연락처"
              className={styles.searchInput}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
            className={styles.select}
          >
            <option value="all">전체 상태</option>
            <option value="new">신규 접수</option>
            <option value="contacted">연락함</option>
            <option value="done">완료</option>
          </select>
        </div>

        <div className={styles.listWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>회사 · 업종</th>
                <th>연락처</th>
                <th>반복 업무</th>
                <th>체크 · 도구</th>
                <th>접수일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className={styles.rowLink}
                  tabIndex={0}
                  role="link"
                  onClick={() => router.push(`/admin/leads/${r.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') router.push(`/admin/leads/${r.id}`)
                  }}
                >
                  <td>
                    <p className={styles.rowCompany}>{r.company || '(회사명 없음)'}</p>
                    <p className={styles.rowMeta}>
                      {r.industry || '업종 미기재'}
                      {r.preferred_contact_time && <span> · {r.preferred_contact_time}</span>}
                    </p>
                  </td>
                  <td>
                    <p className={styles.rowText}>{r.email}</p>
                    <p className={styles.rowMono}>{r.phone || '연락처 없음'}</p>
                  </td>
                  <td>
                    <p className={styles.rowText}>{r.repeat_task || '—'}</p>
                  </td>
                  <td>
                    <p className={styles.rowText}>
                      {r.checked_items?.length ?? 0}/6개
                      {r.tools && r.tools.length > 0 ? ` · ${r.tools.join(', ')}` : ''}
                    </p>
                  </td>
                  <td>
                    <p className={styles.rowMono}>{fmtDateTime(r.created_at)}</p>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${styles[`status_${r.status}`]}`}>
                      {LEAD_STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className={styles.empty}>
              {rows.length === 0 ? '아직 접수된 신청이 없습니다.' : '조건에 맞는 신청이 없습니다.'}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
