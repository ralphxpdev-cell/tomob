# TOMOB Studio (tomob-studio)

상태: `/ax` 라이브(`tomob-studio.vercel.app`) — 히어로·PAIN·WHY TOMOB 카피 새 방향 배포 완료, 자체 업무점검 폼+텔레그램+Supabase+관리자 페이지 구축·검증 완료. 회사소개서 22p 완성(`영업/TOMOB-AX-회사소개서-2026-08-12.html`+`.pdf`)
한 줄 요약: tomob 공식 웹사이트(Next.js) + 독립 AX 수주 랜딩 `/ax`(자체 리드 수집·관리자 포함) + AX 회사소개서
마지막 업데이트: 2026-08-18

---

# ▶ 지금 하는 것 (이 칸은 항상 한 개다)

## SEO — 배포는 끝났고, `www.tomob.cloud` 도메인 소유만 미해결

- 완료: OG·트위터카드·`metadataBase`·파비콘·`robots.ts`·`sitemap.ts` 전부 2026-08-14 배포에 포함되어 `tomob-studio.vercel.app`에 라이브
- 왜 이것인가: 사령관 "카톡 공유했는데 이미지도 별로고" — OG 태그가 전혀 없어 공유 시 썸네일이 안 뜨거나 엉뚱한 화면이 잡혔다
- 다음 행동 1개: `www.tomob.cloud`를 실제로 서빙하는 Vercel 프로젝트를 찾아 이 계정으로 옮기거나 그쪽에도 같은 SEO 변경을 반영한다 — 사령관 판단 필요(아래 「지금 막고 있는 것」)
- 그다음: 네이버 서치어드바이저·구글 서치콘솔 소유확인+사이트맵 제출. 둘 다 사령관 계정 로그인이 있어야 해서 앤이 대신 못 한다
- 직전 트랙(카피 전환 + 자체 업무점검 시스템 구축)은 2026-08-14 완료했다

## 트래픽 확인 — Vercel Analytics 코드 적용, 대시보드에서 켜는 것만 남음

- 완료: 2026-08-18 `@vercel/analytics` 설치, `app/layout.tsx`에 `<Analytics />` 삽입
- 왜 이것인가: 사령관이 `/ax` 랜딩 트래픽을 확인하고 싶어함. GA4는 새 계정 발급이 필요해 더 가벼운 Vercel Analytics로 결정
- 다음 행동 1개: Vercel 대시보드 → tomob-studio 프로젝트 → Analytics 탭에서 기능 활성화(무료 플랜은 활성화만 하면 수집 시작). MCP로는 403(권한 없음)이라 앤이 대신 못 켠다
- 배포 필요: 코드는 로컬에만 있고 아직 커밋·배포 전이다

---

## 확정된 것

| 항목 | 값 | 근거 |
|---|---|---|
| `/ax` 디자인 톤 | 처음AX(ax.cheomservice.com)형 SaaS 블루 — 면 + 1px 테두리 + 라운드 카드 + 소프트 그림자 + 다크 섹션 | `[확정]` 사령관 선택 2026-08-11 |
| 액센트 | `#1D4ED8` (처음AX 실측 `#2B5CD6`을 피해 한 단계 진한 값) | `[발상=앤]` 사령관에 보고함. 정확히 맞추려면 `--accent`/`--accent-ink` 2줄만 교체 |
| 히어로 | 풀페이지 WebGL 성운 + 커서로 젓는 **실제 GPU 유체**(이류→와도→와도강화→발산→압력 자코비 20회→그래디언트 차감) | `[확정]` 사령관 "그 불꽃을 블루/우주 계열로 + 마우스 인터랙션" |
| 히어로 워드마크 | 불꽃 텍스처 제거 → 내비 20px 플랫 텍스트 | `[확정]` 사령관 2026-08-11 |
| 히어로·PAIN·WHY TOMOB 카피 방향 | "AI가 아니라, 구조가 먼저입니다" — AI는 도입해봤지만 회사는 안 바뀌었다는 공감 → 도구가 아니라 방식/구조 문제라는 재프레임. "새다" 비유·"채용" 프레임 전부 제거 | `[확정]` 사령관 2026-08-14. 참고 사이트 문구를 그대로 베끼지 않고 TOMOB 자기 언어(§4.4 "AI를 도입하는 게 아니라 흐름을 다시 만든다")로 재작성 |
| CTA 목적지 | `tomob-seed.vercel.app/request`(외부 도메인)로 나가던 것을 폐기, 페이지 내 `#ax-pain`(자체 업무점검 폼)으로 스크롤 이동 | `[확정]` 사령관 2026-08-14 "다른 서버로 나가는 창이 뜨면 안 된다" — 리드 수집을 tomob-studio 자체 서버 하나로 통일 |
| 업무점검 폼 항목 | 회사명·업종·반복 업무·쓰는 도구(다중선택)·희망 연락 시간대·이메일·연락처·자가진단 체크(6개)·광고성 정보 수신동의 | `[확정]` 2026-08-14. `app/ax/PainCheck.tsx` |
| 리드 저장·알림 | 제출 시 텔레그램(TOMOB Ax 그룹) 전체 내용 즉시 전송 + Supabase(`ax_leads`) 저장 동시 처리, 한쪽 실패해도 한쪽은 남음(`Promise.allSettled`) | `[확정]` 2026-08-14. `app/api/paincheck/route.ts` |
| 텔레그램 봇/방 | `tomob-ax` 프로젝트의 `@tomob_ax_collab_bot` · "TOMOB Ax" 그룹(`chat_id -5547674020`)을 재사용. `tomob-studio`·`tomob-seed` 둘 다 이 봇/방으로 통일 | `[확정]` 사령관 2026-08-14 "그대로 사용해" |
| 관리자 페이지 | `/admin`(목록)·`/admin/leads/[id]`(상세) 신설. tomob-seed의 `/admin`("Mission Control" 다크 콘솔, `#09090b`+`#2595FF`) 시각·기능 패턴을 그대로 이식 — 상태 전이(신규접수/연락함/완료)+이력 기록+텔레그램 알림, 내부 메모 다건, 텔레그램 재전송. 파일업로드·브리프·마감일 등 다주 프로젝트 관리 기능은 리드 성격상 제외 | `[확정]` 사령관 2026-08-14. 근거는 `app/admin/actions.ts`·`AdminList.tsx` 상단 주석 |
| 관리자 인증 | 비밀번호 1개(`ADMIN_PASSWORD`, tomob-seed와 동일 값 재사용) + HMAC 세션 쿠키 | `[확정]` 2026-08-14 MVP |
| 리드 DB | tomob-seed와 **같은 Supabase 프로젝트**(`xynizezgdggiluzxufem`)에 `ax_leads`·`ax_lead_updates`·`ax_lead_notes` 테이블만 신설 — 웹사이트/서버는 안 걸침, DB만 재사용 | `[확정]` 사령관 2026-08-14 |
| 카피 정본 | `영업/TOMOB-AX-랜딩페이지-기획안-2026-08-06.md` §4 + 레퍼런스 3사 문법(대조 구문·부정 선언·동사 종결) — 단 §4.2 히어로 문구는 위 새 방향으로 대체 | `[확정]` 사령관 "레퍼런스 3개 카피톤 비교해서 다시 짜" |
| WORK 노출 | PEACH · LIME 2개만 (`SHOWN` 배열) | `[확정]` 사령관 "피치, 라임만 일단" |
| CTA 버튼 문구 | 전 페이지 **무료 30분 점검** 단일 (버튼 라벨은 유지, 목적지만 내부로 변경) | `[확정]` 사령관 2026-08-11 |
| OWNERSHIP 문구 | "회사마다 전담팀이 배정되어 끝까지 책임집니다" | `[확정=사령관 지정]` ⚠️ 실제 인원과의 간극은 아래 「이슈」. 인수인계 트랙의 움직이는 점 인터랙션은 2026-08-14 제거(레퍼런스에 없는 즉흥 장치였고 반복 시도에도 어색함이 안 잡힘) |
| 가격 3단 | 무료(30분) / 200만 원부터(2–4주) / 협의(월 단위) | `[확인 대기]` 200만 원은 기획안 §4.5의 **초기 가설값**. BOARD `AX-002` 미확정 |
| 배포처 | `tomob-studio.vercel.app` (프로젝트 `prj_sp8gpxeL…`, org `junsungeuns-projects`) | `[확정]` 2026-08-11 프로덕션 배포·curl 200 확인 |
| 회사소개서 구조 | 22p A4 가로: 표지/목차 → 01 Intro → 02 What we do → 03 Products → 04 Case Studies 5건 → 05 Process·책임 → Contact | `[확정]` 사령관 /plan 컨펌 2026-08-13 |
| 운영 주체 표기 | Brimming Studio · 서울특별시 노원구 덕릉로 70가길 101 · sungeunbyeol@gmail.com | `[확정]` 사령관 2026-08-13 |
| LIME 에디터 화면 | `project/이커머스`의 **캔버스 에디터**(텍스트·이미지 요소를 선택해 바꾸는 화면) | `[확정]` 사령관 반복 지적 2026-08-13 |

## 지금 막고 있는 것

- **`www.tomob.cloud`가 이 계정 소유가 아니다.** `vercel domains ls`(계정 `sltime99-1158`→`junsungeuns-projects`)에는 `jandhgroup.co.kr`만 있다. `www.tomob.cloud/ax`는 200을 내지만 **다른 Vercel 계정의 별도 배포**다. 오늘 반영한 카피·SEO·관리자 시스템은 전부 `tomob-studio.vercel.app`에만 있고, `www.tomob.cloud`에는 그 다른 배포를 찾아 옮기기 전까지 안 나간다
- **GitHub 자동 배포 불가.** Vercel이 `ralphxpdev-cell/tomob` 연결을 시도했으나 `You need admin or write access`(400). 그때까지 `vercel deploy --prod` 수동 배포
- BOARD `AX-002`(파일럿 기간·기술 범위) 미확정 → 가격 섹션이 가설값(`200만 원부터`)으로 노출 중

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/ax/page.tsx` | `/ax` 본문. `CONTACT` 상수 = `#ax-pain`(내부 스크롤, 2026-08-14 변경) |
| `app/ax/page.module.css` | `/ax` 전용 스타일. 상단 주석이 토큰 정본(면·선·라운드·그림자·컬럼) |
| `app/ax/HeroField.tsx` | 히어로 풀페이지 성운 + GPU 유체 |
| `app/ax/PainCheck.tsx` | 자가진단 체크리스트 + 업무점검 신청 폼(업종·반복업무·도구·연락시간·연락처, 2026-08-14 확장) |
| `app/api/paincheck/route.ts` | 폼 제출 처리 — 텔레그램 전송 + Supabase(`ax_leads`) 저장 동시 실행 |
| `lib/supabase.ts` | 서버 전용 Supabase 서비스 클라이언트(`SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`) |
| `app/admin/page.tsx` · `AdminList.tsx` · `admin.module.css` | 리드 목록(다크 콘솔 톤, 스탯카드·검색·필터) |
| `app/admin/login/page.tsx` · `app/admin/actions.ts` | 비밀번호 로그인, 리드 조회/상태변경/메모/텔레그램 재전송 Server Actions |
| `app/admin/lead-status.ts` | 리드 상태 상수·라벨·전이 규칙(동기 유틸 — `actions.ts`는 Server Actions만 export 가능해 분리함) |
| `app/admin/leads/[id]/page.tsx` · `LeadDetail.tsx` | 리드 상세 — 신청 내용·진행 이력·상태변경·내부메모·텔레그램 재전송 |
| `app/ax/Reveal.tsx` | 스크롤 리빌 + 수치 카운트업 |
| `app/ax/ax-reset.css` | `globals.css` 전역 element 규칙을 `/ax`에서만 되돌림 |
| `app/layout.tsx` | 폰트 링크 + 사이트 전역 메타데이터(OG·트위터카드·metadataBase) |
| `app/robots.ts` · `app/sitemap.ts` | SEO — 크롤 허용 규칙 · 사이트맵 |
| `영업/TOMOB-AX-랜딩페이지-기획안-2026-08-06.md` | 카피 정본(단, 히어로 §4.2는 2026-08-14 새 방향으로 대체) |
| `영업/AX-레퍼런스-실측분석-2026-08-11.md` | 시각 정본. litmers·처음AX·joshua 실측 |
| `collaboration/BOARD.md` | AX 협업 작업 보드 (AX-001~005) |
| `work.md` | 과거 전부. 2026-08-11 이전 `_PROJECT.md` 전문 보존 |

## 대기 중 (지금 하는 것 아님)

- [ ] `www.tomob.cloud`를 실제로 서빙하는 Vercel 프로젝트 찾아서 이전/동기화
- [ ] `ralphxpdev-cell/tomob` 저장소 권한을 Vercel 계정에 부여해 자동 배포 복구
- [ ] BOARD `AX-002` 확정 후 `engagements`의 `200만 원부터` 교체
- [ ] WORK에 SEEDLOG·TOMOB SEED 추가 여부 (`SHOWN` 배열에 이름만 추가)
- [ ] `/ax` 파트너 실명·경력, 첫 파일럿 사례를 실제 정보로 보강
- [ ] 미사용 파일 정리 판단: `Wordmark.tsx`·`HeroStatement.tsx`·`HeroVisual.tsx`
- [ ] 마케팅: 당근 집행 · 콜드메일 DB 200 · 블로그 1편
- [ ] 외주 공고 헌팅: 위시켓·프리모아 1차 수집 7건에서 사령관 선택 대기
- [ ] 포트폴리오: 알고크라시 연결, `flowing.html` 이미지, `somemood.html` Related Works 썸네일
- [ ] 관리자 목록 페이지의 로그인 화면도 다크 콘솔 톤과 완전히 통일됐는지 재확인(상세 페이지는 확인함)

## 이슈 / 메모

- **⛔ 새 인터랙션을 지어내기 전에 기존 구현을 먼저 읽을 것.** OWNERSHIP 섹션의 "인수인계 트랙" 움직이는 점을 레퍼런스 없이 만들었다가 세 번 고쳐도 어색함이 안 잡혔다. 실제로는 세 레퍼런스(처음AX·litmers·joshua) 어디에도 이런 장치가 없었다 — 결국 통째로 제거. 2026-08-14
- **⛔ 다른 서버를 리드 수집의 정본으로 두지 않는다.** CTA를 `tomob-seed.vercel.app/request`로 보내던 걸 tomob-studio 자체 폼으로 되돌렸다. tomob-seed와는 **DB(Supabase)만 공유**하고 서버/도메인은 분리 상태를 유지한다. 2026-08-14
- **⛔ Server Actions 파일에는 async 함수만 export.** `app/admin/actions.ts`(`'use server'`)에 동기 유틸(`allowedNextStatuses`)을 같이 export했다가 빌드가 통째로 실패했다("Server Actions must be async functions"). 동기 유틸은 별도 파일(`lead-status.ts`)로 분리
- **텔레그램 그룹 chat_id는 재조회 불가.** GitHub Secrets·Vercel 환경변수 둘 다 등록 후에는 값을 다시 못 꺼낸다. `getUpdates`로 잡되, 봇이 프라이버시 모드면 `/`로 시작하는 명령어 메시지만 잡힌다(일반 텍스트는 안 보임)
- **Vercel 환경변수는 실제로 비어있을 수 있다.** `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`가 등록은 됐는데 값이 빈 문자열이라 API가 계속 500을 냈던 적이 있다(2026-08-14). `vercel env ls`는 존재 여부만 보여주고 값은 안 보여주므로, 실제 라이브 엔드포인트에 curl로 테스트 제출해서 확인하는 게 확실하다
- **⛔ 앵커 id에 `ax-` 접두어를 붙일 것.** `globals.css`가 `#hero` `#portfolio` `#pain` `#service` `#process` `#cta`를 전역으로 잡는다
- **⛔ `/ax`에 메인 사이트 컴포넌트를 그냥 두면 안 된다.** `Intro`가 `#page`를 못 찾고 early return해 첫 화면이 5초간 검은 판이었다
- **⛔ 카피를 지어내기 전에 `영업/` 기획안을 먼저 읽을 것.** 단, 방향 전환 자체가 사령관 지시일 때는 기획안보다 최신 지시가 우선(2026-08-14 히어로 카피 사례)
- **⛔ 규모(인원 수) 화법 금지.** TOMOB는 실적이 없으므로 인원을 광고하면 마이너스
- `scroll-behavior: smooth`가 걸려 있어 `window.scrollTo`로 검수하면 스크롤이 안 먹은 것처럼 보인다
- dev 서버 실행 중 `npm run build`를 돌리면 `.next`가 깨져 dev가 500을 낸다. Windows에서 `.next` 캐시가 깨지면(`EINVAL readlink`) `rm -rf .next` 후 재빌드
- 라이브 도메인 2개 상태: `www.tomob.cloud`(다른 계정 배포) / `tomob-studio.vercel.app`(이 계정이 실제로 수정하는 곳)
- `work/` 와 `public/work/`, `port/` 와 `public/port/` 이중 관리 중
