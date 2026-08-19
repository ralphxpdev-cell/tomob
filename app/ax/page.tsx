import type { Metadata } from 'next'
import Image from 'next/image'
import styles from './page.module.css'
import './ax-reset.css'
import Reveal from './Reveal'
import HeroField from './HeroField'
import PainCheck from './PainCheck'

/**
 * 카피 정본: 영업/TOMOB-AX-랜딩페이지-기획안-2026-08-06.md
 * 2026-08-11 사령관 "전체적인 카피들이 너무 거지같아" — 확정 기획안을 안 쓰고 임의 문장을 넣었던 것이
 * 원인이었다. 아래 문구는 전부 그 기획안 §4에서 가져온다. 새로 지어내지 않는다.
 */
const AX_TITLE = 'TOMOB AX — AI가 아니라, 구조가 먼저입니다'
const AX_DESC =
  'TOMOB는 문의, 고객관리, 견적, 보고처럼 대표와 직원의 시간을 반복해서 가져가는 업무를 찾아 실제로 운영되는 웹 시스템과 자동화로 바꿉니다.'

export const metadata: Metadata = {
  title: AX_TITLE,
  description: AX_DESC,
  alternates: { canonical: '/ax' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/ax',
    siteName: 'TOMOB AX',
    title: AX_TITLE,
    description: AX_DESC,
    images: [{ url: '/ax/og-image.png', width: 1200, height: 630, alt: AX_TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: AX_TITLE,
    description: AX_DESC,
    images: ['/ax/og-image.png'],
  },
}

/**
 * WORK 그리드 — 뉴시즌 포트폴리오(project/newseason/portfolio.html) 8개 카드 전부.
 * 로컬 서버로 실제 페이지를 띄워 렌더된 화면을 그대로 캡처했다(card-*.png, 카드 실제 비율 그대로:
 * span2=2:1, span3=3:1, 나머지=1:1). CSS로 재구성하지 않는다.
 * (2026-08-07 사령관 지적: "기존꺼 그대로 안 가져옴" + "비율도 안 맞음" + "더 가져올 게 많은데 왜 4개만" 반영)
 */
/**
 * 2026-08-11 사령관 지시: "피치, 라임만 일단 보여줘도 될 듯. 프로덕트 자체 가지고 있는 거?"
 *
 * 8개를 다 걸면 소개팅 앱·웹게임·커리어 기록 앱이 "반복 업무 자동화"의 증거로 읽히지 않는다.
 * 오히려 AX를 안 해봤다는 인상을 준다. 실제로 소유하고 운영 중인 프로덕트만 남긴다.
 *
 * 후보로 남는 것: SEEDLOG(janong-app 라이브), TOMOB SEED(Supabase+텔레그램 라이브).
 * 둘 다 자사 소유·운영 중이고 AX 문맥에도 맞다. 사령관 판단 후 `SHOWN`에 추가하면 된다.
 * 나머지(FLOWING·토핑업·스타딜리버리·TOMOB)는 AX 증거가 아니므로 배열에만 보존한다.
 */
const SHOWN = ['PEACH', 'LIME']

const allProjects = [
  {
    name: 'PEACH',
    field: '리드 발굴 · 랜딩 빌더',
    src: '/ax/work/card-peach.png',
    alt: 'PEACH 리드 인텔리전스 카드 — 실제 포트폴리오 캡처',
    bg: '#fbeaf0',
    light: true,
    span: 2,
    line: '사람이 검색해서 정리하던 업체 수집과 영업 리드 관리를 한 화면으로 옮겼습니다.',
  },
  {
    name: 'LIME',
    field: '상세페이지 자동생성 · 실운영 114개',
    src: '/ax/work/card-lime.png',
    alt: 'Lime 카드 — 실제 포트폴리오 캡처',
    bg: '#c8f000',
    light: true,
    span: 1,
    line: '상품 등록과 번역, 상세페이지 생성까지 매번 반복하던 작업을 하나의 흐름으로 묶었습니다.',
  },
  {
    name: 'FLOWING',
    field: '가치관 기반 소개팅 서비스',
    src: '/ax/work/card-flowing.png',
    alt: 'Flowing 카드 — 실제 포트폴리오 캡처',
    bg: '#3d1b26',
    span: 2,
    line: '기획부터 UX 리서치까지, AX 이전에 제품 하나를 처음부터 끝까지 만들어 본 경험입니다.',
  },
  {
    name: '토핑업',
    field: '커리어 성장 기록 앱',
    src: '/ax/work/card-topping.png',
    alt: '토핑업 카드 — 실제 포트폴리오 캡처',
    bg: '#f4f4f4',
    light: true,
    span: 1,
    line: '매일의 작업을 기록하고 돌아보는 습관을 앱 하나로 설계했습니다.',
  },
  {
    name: 'SEEDLOG',
    field: '농업 데이터 기록 · 실사용 운영',
    src: '/ax/work/card-seedlog.png',
    alt: 'SeedLog 카드 — 실제 포트폴리오 캡처',
    bg: '#eef2e5',
    light: true,
    span: 1,
    line: '수첩과 사진으로 흩어지던 매일의 작업 기록을 대시보드와 리포트로 남깁니다.',
  },
  {
    name: '스타딜리버리',
    field: '브랜드 참여형 웹게임 캠페인',
    src: '/ax/work/card-starlight.png',
    alt: '스타딜리버리 카드 — 실제 포트폴리오 캡처',
    bg: '#05060f',
    span: 1,
    line: '광고 캠페인을 게임처럼 설계해 리드를 모으는 퍼널을 직접 구축했습니다.',
  },
  {
    name: 'TOMOB SEED',
    field: '고객 접수 → 제작 진행 포털',
    src: '/ax/work/card-seed.png',
    alt: 'TOMOB Seed 카드 — 실제 포트폴리오 캡처',
    bg: '#0d0d0f',
    span: 1,
    line: '전화와 메신저로 받던 요청을 정해진 항목으로 접수하고 담당자에게 바로 넘깁니다.',
  },
  {
    name: 'TOMOB',
    field: 'Three.js 웹게임 제작 시스템',
    src: '/ax/work/card-tomob.png',
    alt: 'tomob 카드 — 실제 포트폴리오 캡처',
    bg: '#07121a',
    span: 3,
    line: '가장 무거운 실시간 3D 시스템까지 직접 설계하고 운영해 본 팀입니다.',
  },
]

/* 2개만 남으면 1행(span-2 + span-1)이 정확히 3열을 채운다. 원본 그리드 규칙 그대로다. */
const projects = allProjects.filter((p) => SHOWN.includes(p.name))

/* 카피 정본: 기획안 §4.6 Find / Build / Run */
const services = [
  {
    no: '01',
    title: 'FIND',
    kr: '업무를 먼저 이해합니다',
    items: ['현재 흐름과 예외 상황 확인', '자동화할 일과 사람이 판단할 일 구분', '성공 기준 합의'],
    body: '어떤 도구를 쓸지는 나중 문제입니다. 지금 무엇이 반복되고 어디서 시간이 가장 오래 걸리는지부터 봅니다.',
  },
  {
    no: '02',
    title: 'BUILD',
    kr: '작동하는 업무 하나를 만듭니다',
    items: ['기존 도구를 가능한 유지', '필요한 화면·DB·자동화 연결', '실제 데이터로 한 사이클 검증'],
    body: '쓰던 엑셀과 카톡을 버리게 하지 않습니다. 그 사이에서 사람이 메우던 전달과 입력부터 연결합니다.',
  },
  {
    no: '03',
    title: 'RUN',
    kr: '회사 안에 남게 운영합니다',
    items: ['담당자가 볼 수 있는 로그와 관리 화면', '장애·API 변경·예외 대응', '운영 매뉴얼과 지속 개선'],
    body: '넘겨주고 끝내지 않습니다. 외부 도구가 바뀌어도 흐름이 멈추지 않게 계속 관리합니다.',
  },
]

/**
 * FLOW — 2026-08-11 개편.
 * 이전에는 SERVICES(FIND/BUILD/RUN)와 같은 말을 4단계로 한 번 더 하는 중복이었다.
 * 처음AX처럼 단계마다 **우리가 하는 일 / 고객이 하는 일 / 산출물 / 다음 단계로 갈 조건**을
 * 갈라 적어, SERVICES(무엇을)와 FLOW(누가 무엇을 받는지)를 분리한다.
 * 각 단계 기간은 기획안 §4.6 기간 표기를 따른다.
 */
const flow = [
  {
    no: '01',
    title: 'DISCOVER',
    kr: '현재 업무 확인',
    dur: '30분',
    us: '현재 흐름과 예외 상황을 듣고 자동화 적합성을 1차 판단합니다.',
    you: '자동화하고 싶은 업무와 반복 주기를 알려주세요.',
    out: '적합성 1차 의견',
    next: '자동화 가치가 보이면 범위 정의로',
  },
  {
    no: '02',
    title: 'DEFINE',
    kr: '범위와 기준 확정',
    dur: '1~3영업일',
    us: '실제 데이터와 양식을 보고 자동화 범위와 예외를 정의합니다.',
    you: '샘플 데이터와 결과물 양식을 제공합니다.',
    out: '범위 정의서 · 검수 체크리스트 · 예상 견적',
    next: '범위와 효과에 합의되면 구축으로',
  },
  {
    no: '03',
    title: 'BUILD',
    kr: '실제 데이터로 구축',
    dur: '2~4주',
    us: '화면·데이터·자동화를 연결하고 실제 데이터 한 사이클로 검증합니다.',
    you: '검증 결과를 함께 확인하고 계속할지 판단합니다.',
    out: '동작하는 업무 흐름 · 검증 기록',
    next: '처리시간이 줄고 검수가 가능하면 운영으로',
  },
  {
    no: '04',
    title: 'RUN',
    kr: '회사에 남게 운영',
    dur: '월 단위',
    us: '담당자 화면·승인 지점·예외 처리·로그를 남기고 계속 관리합니다.',
    you: '운영 담당자와 검수 기준을 확정합니다.',
    out: '운영 시스템 · 매뉴얼 · 운영 리포트',
    next: '다음 병목을 찾아 단계적으로 확장',
  },
]

/**
 * Before / After — 기획안 §4.4.
 * ⛔ 기획안 명시: 이 셋은 '구축 완료 사례'로 표현하지 않는다. 'TOMOB가 우선 진단하는 업무'다.
 * 실제 사례가 생기면 같은 자리를 Before/After 사례로 교체한다.
 */
const changes = [
  {
    no: '01',
    title: '문의에서 후속 연락까지',
    before: ['카톡·메일 확인', '엑셀 입력', '담당자 전달', '후속 연락 기억'],
    after: ['문의 자동 수집', '내용 분류', '고객 DB 저장', '담당자 알림', '미응답 재알림'],
    metric: '최초 응답시간 / 누락 건수 / 수기 입력시간',
  },
  {
    no: '02',
    title: '견적과 제안서 작성',
    before: ['요청사항 정리', '이전 파일 검색', '문서 복사', '금액 수정', 'PDF 발송'],
    after: ['요청 정보 입력', '템플릿 자동 구성', '담당자 검수', 'PDF 생성·기록'],
    metric: '작성시간 / 수정 횟수 / 발송까지 걸린 시간',
  },
  {
    no: '03',
    title: '주간 보고와 정산',
    before: ['여러 파일 취합', '수치 정리', '그래프 생성', '보고서 작성'],
    after: ['데이터 자동 수집', '형식 통일', '요약·이상값 표시', '보고서 초안 생성'],
    metric: '취합시간 / 오류 건수 / 보고 주기',
  },
]

/**
 * 가격 — 기획안 §4.5 가격 노출 원칙.
 *   30분 1차 인터뷰는 무료. 업무 분석 문서까지 무료로 주지 않는다.
 *   파일럿은 초기 가설로 `200만 원부터` 표시하고 2~3건 수행 후 조정한다.
 *   `무료 자동화 구축` `무료 PoC`는 쓰지 않는다.
 * ⚠️ 200만 원은 BOARD AX-002가 확정되기 전의 가설값이다. 확정되면 여기만 고친다.
 */
const engagements = [
  {
    tag: 'STEP 1',
    dur: '30분',
    price: '무료',
    title: '업무점검',
    body: '어떤 업무가 자동화 가치가 있는지 먼저 봅니다. 맞지 않으면 그렇다고 말씀드립니다.',
    items: ['현재 업무 흐름과 반복 주기 확인', '자동화 가능·불가능 영역 구분', '적합성 1차 의견'],
    cta: '무료 30분 점검',
    primary: true,
  },
  {
    tag: 'STEP 2',
    dur: '2~4주',
    price: '200만 원부터',
    title: '고정 범위 파일럿',
    body: '업무 하나로 범위를 고정합니다. 실제 데이터 한 사이클로 검증한 뒤 넓힐지 정합니다.',
    items: ['범위 정의서 · 검수 체크리스트', '화면 · 데이터 · 자동화 연결', '구축 · 검수 · 운영 문서'],
    cta: '파일럿 문의하기',
  },
  {
    tag: 'STEP 3',
    dur: '월 단위',
    price: '범위에 따라 협의',
    title: '운영 파트너십',
    body: '만들어 놓고 떠나지 않습니다. 운영하면서 다음 병목을 찾아 단계적으로 넓힙니다.',
    items: ['장애와 예외 대응', '외부 API 변경 관리', '월 단위 개선과 리포트'],
    cta: '파트너십 문의하기',
  },
]

/* 카피 정본: 기획안 §4.10 FAQ */
const faqs = [
  [
    '어떤 업무부터 자동화해야 하나요?',
    '반복 빈도가 높고, 처리 기준이 있으며, 현재 시간이 측정되는 업무부터 봅니다. 처음부터 회사 전체를 바꾸지 않습니다.',
  ],
  [
    '직원을 줄이기 위한 서비스인가요?',
    '해고를 목적으로 설계하지 않습니다. 지금 인력이 반복 작업에 쓰는 시간을 줄이고, 더 중요한 업무에 투입할 수 있는지 확인하는 것이 목적입니다.',
  ],
  [
    '기존에 쓰는 엑셀이나 카톡을 바꿔야 하나요?',
    '가능하면 기존 도구를 유지하고 그 사이의 전달·입력·알림부터 연결합니다. 도구 교체가 더 경제적일 때만 별도로 제안합니다.',
  ],
  [
    'AI가 잘못 처리하면 어떻게 하나요?',
    '금액, 발송, 계약, 고객 응대처럼 위험한 단계에는 사람 승인과 실행 로그를 둡니다.',
  ],
  [
    '비용은 어떻게 정해지나요?',
    '업무 수, 연결할 도구, 데이터 상태, 예외처리, 관리자 화면 필요 여부에 따라 달라집니다. 첫 파일럿은 업무 하나를 기준으로 범위를 고정해 견적합니다.',
  ],
  [
    '구축 후에는 누가 관리하나요?',
    '운영 매뉴얼을 전달하고, 필요하면 월 단위로 모니터링·오류 대응·개선을 맡습니다.',
  ],
]

const tools = ['KAKAO', 'GOOGLE', 'NOTION', 'SLACK', 'EXCEL', 'GMAIL', 'SUPABASE', 'TELEGRAM']

/**
 * 상담·문의 CTA 목적지.
 * 2026-08-10 사령관 지시로 카카오톡 오픈채팅(`open.kakao.com/o/shXjXCqi`) → TOMOB Seed 접수 포털로 교체.
 * 2026-08-14 사령관 지시로 되돌림 — 다른 도메인(tomob-seed.vercel.app)으로 나가는 창이
 * 뜨면 안 된다. tomob-studio 안의 자가진단 폼(PainCheck, TOMOB Ax 텔레그램으로 확인됨)으로
 * 스크롤 이동시킨다. 페이지의 모든 CTA(내비 CONTACT, 히어로, 계약 방식 2종, 하단 CTA)가
 * 이 한 곳을 쓴다.
 */
const CONTACT = '#ax-pain'

export default function AxPage() {
  return (
    <div className={styles.page} data-ax-page>
      <Reveal />

      {/* 2026-08-11 재작업. 시각 정본: 영업/AX-레퍼런스-실측분석-2026-08-11.md
          사령관 컨펌 = 처음AX형 SaaS 블루 톤 + 히어로 워드마크를 카피로 교체.
          섹션 구성과 문구는 건드리지 않는다("구조를 보라고 한 게 아니다"). 바뀐 것은 디자인 언어뿐이다. */}
      <nav className={styles.nav} aria-label="주요 메뉴">
        <div className={styles.navInner}>
          <a href="#ax-top" className={styles.mark}>
            TOMOB<i>AX</i>
          </a>
          {/* 기획안 §4.1: `서비스`·`솔루션` 같은 회사 중심 메뉴를 피하고 방문자 행동으로 적는다 */}
          <div className={styles.navLinks}>
            <a href="#ax-pain">우리 회사 진단</a>
            <a href="#ax-change">바뀌는 흐름</a>
            <a href="#ax-work">만든 것</a>
            <a href="#ax-flow">진행 방식</a>
          </div>
          <a className={styles.navCta} href={CONTACT}>
            무료 30분 점검
          </a>
        </div>
      </nav>

      {/* 히어로 — 2026-08-11 사령관 지시: "풀페이지에 우리가 만들었던 그 불꽃을 블루계열이나
          우주계열로 바꾸고 마우스 인터랙션하는 걸로."
          `HeroField.tsx`가 그 셰이더다(워드마크 불꽃과 같은 2단 도메인 워프 fBm, 색축만 교체 + 커서 젓기).
          불꽃 텍스처 워드마크(`Wordmark.tsx`)는 내비 텍스트로 내렸고 파일은 보존한다. */}
      <header className={styles.hero} id="ax-top">
        <HeroField className={styles.heroField} />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>어디서부터 시작해야 할지 모르겠다면</span>
          <h1 className={styles.heroTitle}>
            AI가 아니라,
            <br />
            <em>구조가 먼저입니다</em>
          </h1>
          <p className={styles.heroLead}>
            문의·견적·보고처럼 반복되는 업무 하나를 먼저 살펴보고,
            <br />
            실제로 작동하는 시스템으로 만듭니다.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.pill} href={CONTACT}>
              무료 30분 점검
            </a>
            <a className={styles.ghost} href="#ax-services">
              바뀌는 업무 흐름 보기
            </a>
          </div>
          <p className={styles.heroNote}>
            30분 인터뷰 · 업무 하나부터 · 도입이 맞지 않으면 솔직하게 말씀드립니다.
          </p>
        </div>
      </header>

      {/* 2026-08-10 사령관 판정으로 히어로 아래 비주얼 밴드를 통째로 제거.
          - 추상 비주얼(불꽃 → 성운 → 스타딜리버리 은하): "의미 없는 비주얼"
          - Seed 라이브 iframe: 실측 64.34MB / 174요청 (페이지 본체 0.17MB의 380배)
          비주얼은 히어로 워드마크가 이미 담당한다. Seed로는 CTA(`CONTACT`)가 넘긴다.
          보존: 은하 `HeroVisual.tsx`, Seed 밴드는 git 이력. */}

      {/* PAIN — 기획안 §4.3. 히어로가 던진 질문을 방문자가 자기 회사로 확인하는 자리.
          이 섹션이 없어서 히어로 다음에 곧바로 우리 원칙이 나왔고, 그게 설득 실패의 첫 지점이었다. */}
      <section className={`${styles.section} ${styles.onPanel}`} id="ax-pain" data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>SELF CHECK</span>
          <h2>
            정말 도구가 부족한 걸까요,
            <br />
            아니면 일하는 방식이 문제인 걸까요?
          </h2>
          <p>해당되는 항목을 눌러 보세요. 지금 사람이 메우고 있는 지점입니다.</p>
        </div>
        <PainCheck />
      </section>

      {/* ref: AGR — 좌 라벨 / 중앙 진술 / 우 번호 비대칭 3분할 */}
      <section className={styles.tri} data-reveal>
        <p className={styles.label}>WHY TOMOB</p>
        <div className={styles.triBody}>
          <p className={styles.statement}>
            자동화할 수 있다고, 모두 자동화하지 않습니다. 도구만 넣으면 되는 일과 방식부터 바꿔야
            하는 일을 먼저 나눕니다.
          </p>
          <div className={styles.toolNote}>
            <p>쓰던 도구를 버리게 하지 않습니다. 그 사이부터 연결합니다</p>
            <ul className={styles.toolGrid}>
              {tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </div>
        </div>
        <span className={styles.index}>01</span>
      </section>

      <hr className={styles.rule} />

      {/* BEFORE / AFTER — 기획안 §4.4. "이렇게 바뀝니다"의 실물이 없어서 FIND/BUILD/RUN이라는
          추상 3단어만 남아 있던 자리다. 처음AX의 8-STEP 파이프라인이 하는 역할과 같다. */}
      <section className={styles.section} id="ax-change" data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>WHAT WE CHANGE</span>
          <h2>AI를 도입하는 게 아니라, 매일 반복되는 흐름을 다시 만듭니다</h2>
          <p>기능을 붙이는 게 아니라 순서를 바꿉니다. 아래는 우선 진단하는 업무입니다.</p>
        </div>
        <div className={styles.changeList}>
          {changes.map((c, i) => (
            <article key={c.no} data-reveal data-reveal-delay={i * 90}>
              <header>
                <span className={styles.no}>{c.no}</span>
                <h3>{c.title}</h3>
              </header>
              <div className={styles.changeRow}>
                <div className={styles.beforeCol}>
                  <span className={styles.changeLabel}>지금</span>
                  <ol>
                    {c.before.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <span className={styles.changeArrow} aria-hidden="true" />
                <div className={styles.afterCol}>
                  <span className={`${styles.changeLabel} ${styles.changeLabelOn}`}>바꾼 뒤</span>
                  <ol>
                    {c.after.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <p className={styles.changeMetric}>
                <span>측정할 값</span>
                {c.metric}
              </p>
            </article>
          ))}
        </div>
        <p className={styles.changeNote}>
          세 가지는 구축 완료 사례가 아니라 TOMOB가 우선 진단하는 업무입니다. 실제 사례가 생기면 같은
          자리를 도입 전후 수치로 교체합니다.
        </p>
      </section>

      {/* ref: AGR 편집 리듬 + 뉴시즌 포폴 실제 3열 그리드(span-2/span-3) 그대로 */}
      <section className={`${styles.section} ${styles.onPanel}`} id="ax-work" data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>WORK ({projects.length})</span>
          <h2>말보다, 실제로 만든 것으로 설명합니다</h2>
          <p>
            빌려온 고객사 로고가 아니라 직접 설계하고 운영해 온 제품입니다. 그중 반복 업무 자동화와
            바로 이어지는 두 개를 공개합니다.
          </p>
        </div>
        {/* 카드 구조 정본: project/newseason/portfolio.html `.works-grid`/`.card` (2026-08-11 사령관 지시).
            이미지가 카드를 꽉 채우고 텍스트는 그 위에 얹힌다. gap 10px · radius 8px · 좌상단 태그 pill.
            원본에 없는 설명 한 줄은 hover에서 오버레이가 짙어질 때 같이 올라오게 붙였다. */}
        <div className={styles.grid}>
          {projects.map((p, i) => (
            <article
              key={p.name}
              className={`${styles.card} ${
                p.span === 2 ? styles.span2 : p.span === 3 ? styles.span3 : ''
              } ${p.light ? styles.cardLight : ''}`}
              style={{ background: p.bg }}
              data-reveal
              data-reveal-delay={(i % 3) * 90}
            >
              <Image
                className={styles.cardBg}
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
              <span className={styles.cardTag}>{p.field}</span>
              <span className={styles.cardOverlay} aria-hidden="true" />
              <div className={styles.cardInfo}>
                <strong>{p.name}</strong>
                <p>{p.line}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className={styles.rule} />

      <section className={styles.team} data-reveal>
        {/* 2026-08-11 사령관 판정: "이 부분은 마이너스 아닌가" + "회사처럼 보여야지".
            이전 문구는 인원 수(두 명)를 스스로 광고해 규모가 작다는 인상을 먼저 줬고,
            방문자가 실제로 걱정하는 질문(계속 운영될 수 있나)에는 답하지 않았다.
            주어를 우리 조직에서 고객이 겪지 않는 일로 바꾸고, 지속성 답변을 붙인다.
            레퍼런스 대조: litmers는 팀 규모를 신뢰로 쓰고(100+), joshua는 실적을 깔고 나서 "한 팀"을 쓰며,
            처음AX는 팀 얘기를 아예 하지 않는다. TOMOB는 실적이 없으므로 인원 화법을 쓰지 않는다. */}
        {/* 문구는 2026-08-11 사령관 지정: "회사마다 전담팀이 배정되며 끝까지 책임진다".
            ⚠️ 상담 시 "전담팀이 몇 팀인가"라는 후속 질문이 나올 수 있다는 점은 보고했다. */}
        <p className={styles.label}>OWNERSHIP</p>
        <p className={styles.teamCopy}>
          회사마다 전담팀이 배정되어 끝까지 책임집니다. 업무를 직접 들은 담당이 그대로 만들고, 만든
          담당이 그대로 운영합니다.
        </p>
        <p className={styles.teamSub}>
          운영 매뉴얼과 관리 화면을 회사 안에 남기기 때문에, 담당자가 직접 상태를 확인하고 언제든
          이어받을 수 있습니다.
        </p>

        {/* 인수인계 트랙 — 위 문장을 글자로만 두지 않고 구조로 보여준다.
            흔한 진행은 단계마다 인수인계로 끊기고(점선+X), TOMOB는 같은 담당이 끝까지 지나간다.
            2026-08-14: 점이 글자 줄과 같은 높이에 있어 두 번 시도 모두 어색했다(가로지름/사라짐).
            배달앱 배송현황 바 패턴(베이스 레일+채움+정지 마커+이동 점)을 참고해 글자 줄과
            분리된 전용 트랙으로 재작업했다. .hoTrack은 위치 기준 래퍼, 실제 4단계 목록은
            안의 .hoSteps(ol)다 — 레일/점을 li 형제로 두면 <ol> 마크업이 깨져서 분리했다. */}
        <div className={styles.handoff} data-reveal>
          <div className={styles.hoRow}>
            <span className={styles.hoWho}>흔한 진행</span>
            <div className={styles.hoTrack}>
              <ol className={styles.hoSteps}>
                <li>영업</li>
                <li>기획</li>
                <li>제작</li>
                <li>운영</li>
              </ol>
            </div>
          </div>
          <div className={`${styles.hoRow} ${styles.hoRowOn}`}>
            <span className={styles.hoWho}>TOMOB</span>
            <div className={styles.hoTrack}>
              <span className={styles.hoRail} aria-hidden="true" />
              <span className={styles.hoRailFill} aria-hidden="true" />
              <i className={styles.hoDot} aria-hidden="true" />
              <ol className={styles.hoSteps}>
                <li>진단</li>
                <li>설계</li>
                <li>구축</li>
                <li>운영</li>
              </ol>
            </div>
          </div>
          <p className={styles.hoNote}>
            <span aria-hidden="true" /> 표시는 담당이 바뀌며 맥락이 끊기는 지점입니다.
          </p>
        </div>
        <span className={styles.index}>02</span>
      </section>

      <hr className={styles.rule} />

      {/* ref: AGR — 번호 + 대문자 제목 + 항목 + 본문의 행 리스트 */}
      <section className={styles.section} id="ax-services" data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>SERVICES ({services.length})</span>
          <h2>진단하고, 만들고, 운영합니다</h2>
          <p>도구를 먼저 고르지 않습니다. 어떤 일이 반복되는지부터 봅니다.</p>
        </div>
        <div className={styles.serviceList}>
          {services.map((s, i) => (
            <article key={s.no} data-reveal data-reveal-delay={i * 80}>
              <span className={styles.no}>{s.no}</span>
              <h3>
                {s.title}
                <em>{s.kr}</em>
              </h3>
              <ul>
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <hr className={styles.rule} />

      {/* ref: AGR — 4열 계단식. 열마다 퍼센트와 길이가 다른 진행 바 */}
      <section className={`${styles.section} ${styles.onDark}`} id="ax-flow" data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>FLOW</span>
          <h2>한 번에 회사를 바꾸지 않습니다</h2>
          <p>업무 하나를 실제 데이터로 한 사이클 돌려 본 뒤에 다음으로 갑니다.</p>
        </div>
        <div className={styles.stair}>
          {flow.map((f, i) => (
            <article key={f.title} data-reveal data-reveal-delay={i * 110}>
              <header>
                <span className={styles.stepNo}>{f.no}</span>
                <h3>
                  {f.title}
                  <em>{f.kr}</em>
                </h3>
                <span className={styles.stepDur}>{f.dur}</span>
              </header>
              <dl>
                <dt>TOMOB</dt>
                <dd>{f.us}</dd>
                <dt>고객</dt>
                <dd>{f.you}</dd>
                <dt>산출물</dt>
                <dd className={styles.stepOut}>{f.out}</dd>
              </dl>
              <p className={styles.stepNext}>{f.next}</p>
            </article>
          ))}
        </div>
        <p className={styles.flowNote}>
          효과가 부족하거나 데이터·업무 기준이 맞지 않으면 다음 단계로 넘어가지 않습니다.
        </p>
      </section>

      <hr className={styles.rule} />

      {/* ref: AGR — 진술 + pill + 카운트업 수치 */}
      <section className={styles.tri} data-reveal>
        <p className={styles.label}>IN NUMBERS</p>
        <div className={styles.triBody}>
          {/* 고객 AX 성과 수치는 아직 없다. 없는 척하지도, 자기비하로 시작하지도 않는다.
              측정 기준과 함께 공개하겠다는 약속으로 적는다. (기획안 §6 과장 표현 금지) */}
          <p className={styles.statement}>
            첫 파일럿의 도입 전후 수치는 측정 기준과 산식을 함께 이 자리에 공개합니다. 근거 없는
            절감률은 쓰지 않습니다.
          </p>
          <div className={styles.actions}>
            <a className={styles.pill} href={CONTACT}>
              무료 30분 점검
            </a>
            <a className={styles.ghost} href="#ax-work">
              구축 사례 보기
            </a>
          </div>
          {/* 인원 수(`2 끝까지 맡는 책임 파트너`)를 실적처럼 크게 띄우던 칸을 제거했다.
              2가 두 번 나와 규모가 작다는 인상만 남겼다. 서비스 스펙 3개로 교체한다. */}
          <div className={styles.stats}>
            <div>
              <strong data-count={allProjects.length} data-count-suffix="">
                0
              </strong>
              <span>직접 설계·구축한 제품과 시스템</span>
            </div>
            <div>
              <strong>30분</strong>
              <span>무료 업무점검</span>
            </div>
            <div>
              <strong>2–4</strong>
              <span>첫 파일럿 구축 (주)</span>
            </div>
          </div>
        </div>
        <span className={styles.index}>03</span>
      </section>

      <hr className={styles.rule} />

      <section className={`${styles.section} ${styles.onPanel}`} data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>ENGAGEMENTS ({engagements.length})</span>
          <h2>큰 AX 계획보다, 지금 가장 비싼 업무 하나부터 봅니다</h2>
          <p>효과를 확인한 뒤에 다음 병목으로 넓힙니다.</p>
        </div>
        <div className={styles.plans}>
          {engagements.map((e, i) => (
            <article
              key={e.tag}
              className={e.primary ? styles.planOn : undefined}
              data-reveal
              data-reveal-delay={i * 90}
            >
              <div className={styles.planTop}>
                <span className={styles.no}>{e.tag}</span>
                <span className={styles.planDur}>{e.dur}</span>
              </div>
              <strong className={styles.planPrice}>{e.price}</strong>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
              <ul>
                {e.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className={e.primary ? styles.pill : styles.ghost}
                href={CONTACT}
              >
                {e.cta}
              </a>
            </article>
          ))}
        </div>
        <p className={styles.planNote}>
          30분 점검은 무료지만 업무 분석 문서까지 무료로 드리지는 않습니다. 파일럿 금액은 첫 사례
          2~3건을 마친 뒤 조정합니다.
        </p>
      </section>

      <hr className={styles.rule} />

      <section className={styles.faq} data-reveal>
        <div className={styles.head}>
          <span className={styles.kicker}>FAQ</span>
          <h2>자주 묻는 질문</h2>
          <p>시작 전에 많이 묻는 내용입니다.</p>
        </div>
        <div className={styles.faqList}>
          {faqs.map(([q, a], i) => (
            <details key={q} data-reveal data-reveal-delay={i * 60}>
              <summary>
                <span className={styles.no}>{String(i + 1).padStart(2, '0')}</span>
                {q}
                <i aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 최종 CTA — 라운드 다크 박스 안에 넣는다(레퍼런스 실측: 처음AX 최종 CTA와 같은 처리) */}
      <section className={styles.cta} data-reveal>
        <div className={styles.ctaBox}>
          <span className={styles.kickerLight}>START WITH ONE WORKFLOW</span>
          <h2>
            다음 직원을 뽑기 전에,
            <br />그 사람이 맡을 일부터 보여주세요.
          </h2>
          <p className={styles.ctaSub}>
            30분이면 지금 사람이 메우고 있는 업무와 자동화 가능 범위를 함께 확인할 수 있습니다.
          </p>
          <a className={styles.pill} href={CONTACT}>
            무료 30분 점검
          </a>
        </div>
      </section>

      {/* 푸터 — AGR식 대형 워드마크 반복을 제거하고 기업형 정보 푸터로 교체 */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerLeft}>
            <span className={styles.footerMark}>
              TOMOB<i>AX</i>
            </span>
            <p className={styles.footerCopy}>AI가 아니라, 구조가 먼저입니다.</p>
            <a href="mailto:tomobstudio@gmail.com">tomobstudio@gmail.com</a>
            {/* CTA 목적지는 2026-08-10에 카카오 오픈채팅 → Seed 접수 포털로 바뀌었다. 라벨도 맞춘다. */}
            <a href={CONTACT}>
              업무 점검 신청 <span aria-hidden="true">↗</span>
            </a>
          </div>
          <ul className={styles.footerWork}>
            {projects.map((p) => (
              <li key={p.name}>
                <span className={styles.thumb} style={{ background: p.bg }}>
                  <Image src={p.src} alt="" fill sizes="48px" />
                </span>
                <strong>{p.name}</strong>
                <em>{p.field}</em>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.footerBase}>
          <p>SEOUL, KOREA</p>
          <p>© 2026 TOMOB. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}
