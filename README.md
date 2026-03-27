# TOMOB - Company Website

브랜딩, 웹사이트, 마케팅을 아우르는 AI 에이전시 토모브의 웹사이트

## 프로젝트 구조

```
tomob/
├── index.html              # 메인 HTML 파일
├── css/
│   └── style.css          # 전체 스타일시트
├── js/
│   ├── cursor.js          # 커스텀 커서 기능
│   ├── intro.js           # 인트로 애니메이션
│   ├── navigation.js      # 섹션 네비게이션
│   └── animations.js      # 섹션별 애니메이션
└── assets/                # 이미지 및 미디어 파일 (추가 예정)
```

## 주요 기능

### 1. **가로 스크롤 레이아웃**
- 8개의 섹션이 가로로 연결된 원페이지 사이트
- 마우스 휠, 터치, 키보드로 네비게이션 가능

### 2. **인트로 애니메이션**
- 커튼 오픈 효과로 시작
- 순차적인 요소 등장 애니메이션

### 3. **커스텀 커서**
- 인터랙티브 요소에 호버 시 반응하는 커서

### 4. **섹션별 애니메이션**
- 각 섹션 진입 시 자연스러운 애니메이션 효과

### 5. **반응형 디자인**
- 데스크톱, 태블릿, 모바일 최적화

## 성능 최적화

### 파일 분리
- HTML, CSS, JavaScript를 별도 파일로 분리하여 브라우저 캐싱 최적화
- JavaScript 모듈화로 유지보수성 향상

### 로딩 최적화
- Google Fonts preconnect로 폰트 로딩 속도 개선
- CSS/JS 파일 순서 최적화로 렌더링 차단 최소화

### 애니메이션 최적화
- CSS transform과 opacity만 사용하여 GPU 가속 활용
- JavaScript는 클래스 추가/제거만 담당

## 사용 방법

### 로컬 개발
1. 파일을 다운로드하거나 클론
2. `index.html` 파일을 브라우저에서 열기
3. 별도의 빌드 과정 불필요

### 배포
- 모든 파일을 웹 서버에 업로드
- 정적 호스팅 서비스 사용 가능 (Vercel, Netlify, GitHub Pages 등)

## 섹션 구성

1. **Hero** - 메인 히어로 섹션
2. **About** - 회사 소개
3. **Business** - 사업 영역 (Branding, Commerce, MCN)
4. **Branding** - 브랜딩 서비스 상세
5. **Commerce** - 커머스 서비스 상세
6. **Partnership** - 크리에이터 파트너십
7. **Portfolio** - 포트폴리오
8. **Contact** - 연락처 및 문의

## 커스터마이징

### 색상 변경
`css/style.css` 파일의 `:root` 섹션에서 CSS 변수 수정:

```css
:root {
    --black: #0a0a0a;      /* 메인 배경색 */
    --white: #f5f5f5;      /* 메인 텍스트 색 */
    --accent: #ff3d00;     /* 강조 색상 */
    --gray: #888;          /* 보조 텍스트 색 */
    --light-gray: #1a1a1a; /* 보조 배경색 */
}
```

### 콘텐츠 수정
- `index.html` 파일에서 텍스트 및 구조 변경
- `image-placeholder` 클래스를 가진 요소를 실제 이미지로 교체

### 애니메이션 추가
- `js/animations.js`에서 섹션별 애니메이션 로직 추가

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이선스

© TOMOB - All rights reserved
