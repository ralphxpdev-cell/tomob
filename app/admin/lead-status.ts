// 리드 상태 상수·라벨·전이 규칙. 'use server' 파일(actions.ts)에는 async 함수만 export할 수
// 있어서(Server Actions must be async functions) 동기 유틸은 별도 파일로 분리했다.

export const LEAD_STATUSES = ['new', 'contacted', 'done'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: '신규 접수',
  contacted: '연락함',
  done: '완료',
}

// 선형 진행이 기본이지만 되돌림(예: 잘못 연락함 처리)도 허용한다 — 리드는 프로젝트보다
// 상태가 단순해서 tomob-seed처럼 전이 그래프를 따로 검증할 필요가 없다. new/contacted/done
// 세 값 중 어디로든 이동 가능(자기 자신 제외)하게 열어 두고, 실수 교정 비용을 낮춘다.
export function allowedNextStatuses(current: LeadStatus): LeadStatus[] {
  return LEAD_STATUSES.filter((s) => s !== current)
}
