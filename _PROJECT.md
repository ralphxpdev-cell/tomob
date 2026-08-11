# TOMOB Studio (tomob-studio)

상태: `/ax` AX 수주 랜딩 전면 재작업 완료 · `tomob-studio.vercel.app` 프로덕션 배포됨 · **git 미커밋**
한 줄 요약: tomob 공식 웹사이트(Next.js) + 독립 AX 수주 랜딩 `/ax`
마지막 업데이트: 2026-08-11

---

# ▶ 지금 하는 것 (이 칸은 항상 한 개다)

## `/ax` 재작업분을 잃지 않게 저장소에 넣는다

- 다음 행동 1개: `app/ax/`, `public/ax/`, `components/{Intro,Cursor,ClientEffects}.tsx`, `app/layout.tsx`, `app/ax/ax-reset.css`, `.vercelignore`를 커밋한다 (`collaboration/`·`sessions/`·`*.psd`·`image/`는 제외)
- 왜 이것인가: `/ax` 전체가 untracked라 **로컬 디스크에만 존재한다.** 오늘 하루치 재작업 전부가 디스크 사고 하나로 사라진다. 사령관이 2026-08-11 "배포만, 커밋 없이"를 선택한 것은 배포 시점 한정이었고, 저장 자체를 안 하기로 한 것은 아니다
- 다른 트랙은 지금 건드리지 않는다 — 아래 「대기 중」

---

## 확정된 것

| 항목 | 값 | 근거 |
|---|---|---|
| `/ax` 디자인 톤 | 처음AX(ax.cheomservice.com)형 SaaS 블루 — 면 + 1px 테두리 + 라운드 카드 + 소프트 그림자 + 다크 섹션 | `[확정]` 사령관 선택 2026-08-11 |
| 액센트 | `#1D4ED8` (처음AX 실측 `#2B5CD6`을 피해 한 단계 진한 값) | `[발상=앤]` 사령관에 보고함. 정확히 맞추려면 `--accent`/`--accent-ink` 2줄만 교체 |
| 히어로 | 풀페이지 WebGL 성운 + 커서로 젓는 **실제 GPU 유체**(이류→와도→와도강화→발산→압력 자코비 20회→그래디언트 차감) | `[확정]` 사령관 "그 불꽃을 블루/우주 계열로 + 마우스 인터랙션" |
| 히어로 워드마크 | 불꽃 텍스처 제거 → 내비 20px 플랫 텍스트 | `[확정]` 사령관 2026-08-11 |
| 카피 정본 | `영업/TOMOB-AX-랜딩페이지-기획안-2026-08-06.md` §4 + 레퍼런스 3사 문법(대조 구문·부정 선언·동사 종결) | `[확정]` 사령관 "레퍼런스 3개 카피톤 비교해서 다시 짜" |
| WORK 노출 | PEACH · LIME 2개만 (`SHOWN` 배열) | `[확정]` 사령관 "피치, 라임만 일단" |
| CTA 문구 | 전 페이지 **무료 30분 점검** 단일 | `[확정]` 사령관 2026-08-11 |
| OWNERSHIP 문구 | "회사마다 전담팀이 배정되어 끝까지 책임집니다" | `[확정=사령관 지정]` ⚠️ 실제 인원과의 간극은 아래 「이슈」 |
| 가격 3단 | 무료(30분) / 200만 원부터(2–4주) / 협의(월 단위) | `[확인 대기]` 200만 원은 기획안 §4.5의 **초기 가설값**. BOARD `AX-002` 미확정 |
| 배포처 | `tomob-studio.vercel.app` (신규 프로젝트 `prj_sp8gpxeL…`, org `junsungeuns-projects`) | `[확정]` 2026-08-11 프로덕션 배포·curl 200 확인 |

## 지금 막고 있는 것

- **`/ax`가 커밋되지 않았다.** `app/ax/`·`public/ax/` 전부 untracked. 로컬에만 존재
- **회사 도메인에 `/ax`가 없다.** `www.tomob.cloud/` 는 200(Vercel)인데 `www.tomob.cloud/ax` 는 **404**. 즉 실제 라이브 도메인은 내가 배포한 `tomob-studio` 프로젝트가 아니라 **다른 Vercel 프로젝트**에서 나가고 있다. CLI 계정(`sltime99-1158` → `junsungeuns-projects`)에서는 그 프로젝트가 안 보인다 → 도메인 소유 계정 확인 필요
- **GitHub 자동 배포 불가.** `vercel link`가 `ralphxpdev-cell/tomob` 연결을 시도했으나 `You need admin or write access` (400). 이 Vercel 계정에 저장소 권한이 없어 매번 CLI 수동 배포해야 함
- BOARD `AX-002`(파일럿 기간·가격·기술 범위) 미확정 → 가격 섹션이 가설값으로 노출 중

## 핵심 파일

| 파일 | 역할 |
|---|---|
| `app/ax/page.tsx` | `/ax` 본문. 상단 주석에 카피 정본 경로·`SHOWN` 규칙 명시 |
| `app/ax/page.module.css` | `/ax` 전용 스타일. 상단 주석이 토큰 정본(면·선·라운드·그림자·컬럼) |
| `app/ax/HeroField.tsx` | 히어로 풀페이지 성운 + GPU 유체. `HeroVisual.tsx`의 유체 풀이를 상수까지 그대로 이식 |
| `app/ax/PainCheck.tsx` | 자가 진단 체크리스트(3개 이상 시 판정 문구 전환) |
| `app/ax/Reveal.tsx` | 스크롤 리빌 + 수치 카운트업. `.isIn`을 인수인계 트랙 애니메이션 게이트로도 씀 |
| `app/ax/ax-reset.css` | `globals.css` 전역 element 규칙을 `/ax`에서만 되돌림 |
| `app/ax/Wordmark.tsx` | (미사용·보존) 불꽃 워드마크. 되살리려면 Geist 폰트 링크 복구 필요 |
| `app/ax/HeroStatement.tsx` | (미사용·보존) watson식 진술문 + 미디어 칩 |
| `app/ax/HeroVisual.tsx` | (미사용·보존) 스타딜리버리 은하 + GPU 유체. **유체 정본** |
| `components/Intro.tsx` | 메인 인트로 오버레이. `/ax`에서는 렌더 안 함 + `#page` 없는 라우트에서도 오버레이를 걷도록 수정 |
| `components/Cursor.tsx` · `ClientEffects.tsx` | `/ax`에서 렌더/실행 안 함 (`usePathname` 가드) |
| `app/layout.tsx` | 폰트 링크. `/ax`용은 Pretendard 1개만 남김 |
| `.vercelignore` | 업로드 제외(`image/` 85MB·`영업/`·`sessions/`·`*.psd` 등). **untracked** |
| `영업/TOMOB-AX-랜딩페이지-기획안-2026-08-06.md` | **카피 정본** |
| `영업/AX-레퍼런스-실측분석-2026-08-11.md` | **시각 정본.** litmers·처음AX·joshua 실측 + 컨펌 결과 + 구현 시 벗어난 값 |
| `영업/AGR-실측-정본-2026-08-07.md` | 구 시각 정본. 에디토리얼 문법이라 2026-08-11에 폐기됨 — 참고용 |
| `app/page.tsx` · `app/globals.css` | 메인 사이트 소스 (`css/style.css`·`index.html` 아님) |
| `collaboration/BOARD.md` | AX 협업 작업 보드 (AX-001~005) |
| `work.md` | 과거 전부. 2026-08-11 이전 `_PROJECT.md` 전문 보존 |

## 대기 중 (지금 하는 것 아님)

- [ ] `www.tomob.cloud`를 서빙하는 Vercel 프로젝트/계정 확인 → `/ax`를 거기에 올릴지, `tomob-studio`에 도메인을 붙일지 결정
- [ ] `ralphxpdev-cell/tomob` 저장소 권한을 Vercel 계정에 부여해 자동 배포 복구
- [ ] BOARD `AX-002` 확정 후 `engagements`의 `200만 원부터` 교체
- [ ] WORK에 SEEDLOG·TOMOB SEED 추가 여부 (`SHOWN` 배열에 이름만 추가). 둘 다 자사 소유·라이브·AX 문맥 부합
- [ ] `/ax` 파트너 실명·경력, 첫 파일럿 사례를 실제 정보로 보강
- [ ] 미사용 파일 정리 판단: `Wordmark.tsx`·`HeroStatement.tsx`·`HeroVisual.tsx`, `public/ax/*.png` GPT 4종, `public/ax/work/mockup-*.png` 8종
- [ ] TOMOB Seed AX 전환 (별도 저장소 `project/tomob-seed`, **빌드 깨진 중간 상태 — 배포 금지**). 백업 `backup/web-production-20260810`
- [ ] 마케팅: 당근 집행 · 콜드메일 DB 200 · 블로그 1편
- [ ] 외주 공고 헌팅: 위시켓·프리모아 1차 수집 7건에서 사령관 선택 대기
- [ ] 포트폴리오: 알고크라시 연결, `flowing.html` 이미지, `somemood.html` Related Works 썸네일

## 이슈 / 메모

- **⛔ 앵커 id에 `ax-` 접두어를 붙일 것.** `globals.css`가 `#hero` `#portfolio` `#pain` `#service` `#process` `#cta`를 전역으로 잡는다. `/ax`에 `id="pain"`을 썼다가 섹션이 통째로 검게 깔렸다 (2026-08-11)
- **⛔ `/ax`에 메인 사이트 컴포넌트를 그냥 두면 안 된다.** `Intro`가 `#page`를 못 찾고 early return해 **첫 화면이 5초간 검은 판**이었다(첫 페인트 9.8초). 라우트 가드로 해결
- **⛔ 새 인터랙션을 지어내기 전에 기존 구현을 먼저 읽을 것.** 유체 인터랙션을 `HeroVisual.tsx`를 안 보고 새로 짰다가 "예전에 그 느낌이 아닌데"로 반려됐다. 정본은 실제 Navier-Stokes 풀이다
- **⛔ 카피를 지어내기 전에 `영업/` 기획안을 먼저 읽을 것.** 확정 카피 기획안이 있는데 안 읽고 밋밋한 문장을 써서 "전체적인 카피들이 너무 거지같아"를 받았다
- **⛔ 규모(인원 수) 화법 금지.** litmers는 규모를 신뢰로 쓰고 joshua는 실적을 깔고 나서 "한 팀"을 쓰며 처음AX는 팀 얘기를 안 한다. TOMOB는 실적이 없으므로 인원을 광고하면 마이너스다 (사령관 판정 2026-08-11)
- ⚠️ "회사마다 전담팀이 배정"은 팀이 여러 개 있다는 뜻으로 읽힌다. 상담에서 규모 질문이 나올 수 있음을 사령관에게 보고했고 사령관이 그대로 진행 결정. 조이려면 "프로젝트마다 전담 담당이 배정되어"로 한 단어 교체
- `scroll-behavior: smooth`가 걸려 있어 `window.scrollTo`로 검수하면 스크롤이 안 먹은 것처럼 보인다. `behavior:'instant'`를 명시할 것
- dev 서버 실행 중 `npm run build`를 돌리면 `.next`가 깨져 dev가 500을 낸다
- 콘솔의 `mini-css-extract-plugin/hmr` 에러는 CSS 연속 수정 시 나는 **dev 전용 잡음**. 프로덕션 번들에 없음
- 라이브 도메인 2개 상태: `www.tomob.cloud`(메인, `/ax` 없음) / `tomob-studio.vercel.app`(메인 + `/ax`). 정리 필요
- `work/` 와 `public/work/`, `port/` 와 `public/port/` 이중 관리 중
