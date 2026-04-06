export default function Home() {
  return (
    <>
      <nav>
        <a href="#" className="logo">TOMOB<em>.</em></a>
        <div className="nav-r">
          <a href="#portfolio" className="nl">Work</a>
          <a href="#service" className="nl">Service</a>
          <a href="#process" className="nl">Process</a>
          <a href="#cta" className="ncta">무료 점검받기</a>
        </div>
      </nav>

      <div id="page">

        {/* HERO */}
        <section id="hero">
          <div className="hv">
            <video autoPlay muted loop playsInline>
              <source src="https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/mainhero.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hc">
            <div className="hbadge">브랜딩 · 웹사이트 · 마케팅 에이전시, TOMOB</div>
            <h1 className="ht">
              매출이 막혔다면<br />
              <span className="ht-cycle-wrap">
                <span className="ht-bracket">[</span>
                <span className="ht-cycle" id="htCycle">AI만으론 안 됩니다</span>
                <span className="ht-bracket">]</span>
              </span><br />
              <em>방향성</em>부터 봅니다.
            </h1>
            <a href="#cta" className="hcta">무료 점검받기 →</a>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="portfolio">
          <div className="pg-wrap">
            <div className="rv"><span className="sec-label">03 — Our Work</span></div>
            <div className="project-grid" id="projectGrid">
              <div className="project-item">
                <a href="https://www.behance.net/gallery/207157553/Flowing-Dating-App-UIUX-Design" className="project-link" target="_blank" rel="noopener noreferrer">
                  <img src="https://mgpxqmqvlbjfywbbsiwt.supabase.co/storage/v1/object/public/images/flowing.png" className="project-img" alt="FLOWING" />
                </a>
                <div className="project-meta">WEB/APP</div>
                <div className="project-title">FLOWING</div>
              </div>
              <div className="project-item">
                <a href="https://somemooddesign.com/" className="project-link" target="_blank" rel="noopener noreferrer">
                  <img src="https://mgpxqmqvlbjfywbbsiwt.supabase.co/storage/v1/object/public/images/somemooddesign.png" className="project-img" alt="SOMEMOODDESIGN" />
                </a>
                <div className="project-meta">Ecommerce WEB</div>
                <div className="project-title">SOMEMOODDESIGN</div>
              </div>
              <div className="project-item">
                <a href="https://lafco.co.kr/" className="project-link" target="_blank" rel="noopener noreferrer">
                  <img src="https://mgpxqmqvlbjfywbbsiwt.supabase.co/storage/v1/object/public/images/lafco.png" className="project-img" alt="LAFCO" />
                </a>
                <div className="project-meta">Ecommerce WEB</div>
                <div className="project-title">LAFCO</div>
              </div>
              <div className="project-item">
                <a href="https://laikin.co.kr/index.html" className="project-link" target="_blank" rel="noopener noreferrer">
                  <img src="https://mgpxqmqvlbjfywbbsiwt.supabase.co/storage/v1/object/public/images/laikin.png" className="project-img" alt="LAiKiN" />
                </a>
                <div className="project-meta">Ecommerce WEB</div>
                <div className="project-title">LAiKiN</div>
              </div>
              <div className="project-item">
                <a href="#" className="project-link">
                  <img src="https://mgpxqmqvlbjfywbbsiwt.supabase.co/storage/v1/object/public/images/algo.png" className="project-img" alt="알고크라시" />
                </a>
                <div className="project-meta">WEB/SAAS</div>
                <div className="project-title">알고크라시</div>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEW */}
        <section id="review">
          <div className="rv-wrap">
            <div className="rv"><span className="sec-label">04 — Reviews</span></div>
            <h2 className="sec-title rv">함께한 분들의<br />이야기예요.</h2>
          </div>
          <div className="tw">
            <div className="tr fwd">
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">전체적인 퀄리티와 구성력이 인상 깊었어요.</p><span className="tc-name">— bb2***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">빠르게 방향을 잡아주시고 의견 반영도 확실했어요.</p><span className="tc-name">— aa1***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">디자이너가 정말 매끄럽고 작업속도가 빠릅니다.</p><span className="tc-name">— ff6***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">스타트업 기획을 안정감 있게 정리해주셨어요. 빠르고 정확해서 신뢰가 갔습니다.</p><span className="tc-name">— cc3***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">처음엔 간단한 요청만 드렸는데, 브랜드 구조까지 잡아주셨어요.</p><span className="tc-name">— pp9***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">기획부터 디자인, 개발까지 전체 프로세스를 빠르고 안정적으로 이끌어주셔서 감탄이 많았습니다.</p><span className="tc-name">— vv2***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">반복 요청 없이도 완벽히 이해하고 정리해주셔서 감동이었어요.</p><span className="tc-name">— dd4***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">속도가 정말 빠르고 결과물도 만족스러웠습니다.</p><span className="tc-name">— ee5***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">전체적인 퀄리티와 구성력이 인상 깊었어요.</p><span className="tc-name">— bb2***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">빠르게 방향을 잡아주시고 의견 반영도 확실했어요.</p><span className="tc-name">— aa1***님</span></div>
            </div>
          </div>
          <div className="tw">
            <div className="tr rev">
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">정확하고 효율적으로 정리해주셔서 좋았어요.</p><span className="tc-name">— hh8***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">기획부터 정리까지 한 번에 매끄럽게 진행해주셔서 감사해요.</p><span className="tc-name">— gg7***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">대표님이 피드백을 놓치지 않고 하나씩 챙겨주셔서 정말 든든했어요.</p><span className="tc-name">— mm4***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">빠르게 일정 맞춰주셨고, 결과도 기대 이상이었습니다.</p><span className="tc-name">— ss3***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">구조, 흐름, 디자인까지 전체 그림을 먼저 잡아주셔서 결정이 빠르고 스트레스가 없었어요.</p><span className="tc-name">— rr7***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">전보다 훨씬 이해도 높은 결과가 나왔고, 커뮤니케이션도 정말 원활했어요.</p><span className="tc-name">— yy1***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">정확하고 효율적으로 정리해주셔서 좋았어요.</p><span className="tc-name">— hh8***님</span></div>
              <div className="tc"><div className="tc-stars">★★★★★</div><p className="tc-text">기획부터 정리까지 한 번에 매끄럽게 진행해주셔서 감사해요.</p><span className="tc-name">— gg7***님</span></div>
            </div>
          </div>
        </section>

        {/* PAIN POINT */}
        <section id="pain">
          <div className="pain-wrap">
            <div className="rv"><span className="sec-label">05 — Why TOMOB</span></div>

            <div className="pain-block-open rv">
              <div className="pain-text">
                <div className="pain-badge">TOMOB 01</div>
                <h3 className="pain-title">결과물에<br />브랜드가 <em>있어야</em> 합니다.</h3>
                <p className="pain-desc">누구나 만들 수 있는 건 브랜딩이 아니에요.<br />토모브는 당신만의 브랜드를 만들어드려요.</p>
              </div>
              <div className="pain-vis-wrap">
                <video className="pain-video" autoPlay muted loop playsInline>
                  <source src="https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/0323.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="pain-block-open rv">
              <div className="pain-text">
                <div className="pain-badge">TOMOB 02</div>
                <h3 className="pain-title">속도보다<br />방향이 <em>먼저</em>입니다.</h3>
                <p className="pain-desc">빠르게 만드는 건 누구나 해요.<br />토모브는 맞는 방향으로 만듭니다.</p>
              </div>
              <div className="pain-vis-wrap">
                <div className="vis-radiate" id="radiate-svg">
                  <svg id="radiate-lines" viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line className="ray" data-x2="380" data-y2="20"  x1="200" y1="130" x2="380" y2="20"  stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="390" data-y2="50"  x1="200" y1="130" x2="390" y2="50"  stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="395" data-y2="80"  x1="200" y1="130" x2="395" y2="80"  stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="395" data-y2="110" x1="200" y1="130" x2="395" y2="110" stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="390" data-y2="140" x1="200" y1="130" x2="390" y2="140" stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="385" data-y2="170" x1="200" y1="130" x2="385" y2="170" stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="375" data-y2="200" x1="200" y1="130" x2="375" y2="200" stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="360" data-y2="230" x1="200" y1="130" x2="360" y2="230" stroke="#2a2a2a" strokeWidth="1"/>
                    <line className="ray" data-x2="340" data-y2="250" x1="200" y1="130" x2="340" y2="250" stroke="#2a2a2a" strokeWidth="1"/>
                    <line id="ray-shoot" x1="200" y1="130" x2="202" y2="130" stroke="#E94318" strokeWidth="2" opacity="0"/>
                    <rect className="diamond" x="188" y="118" width="24" height="24" fill="#E94318" transform="rotate(45 200 130)"/>
                  </svg>
                  <div className="vis-radiate-label">방향성</div>
                </div>
              </div>
            </div>

            <div className="pain-block-open rv">
              <div className="pain-text">
                <div className="pain-badge">TOMOB 03</div>
                <h3 className="pain-title">토모브는 다양한 도메인 경험으로<br /><em>문제를 해결</em>합니다.</h3>
                <p className="pain-desc">이커머스, 스타트업, 서비스업까지.<br />업종은 달라도 문제의 본질은 같아요.<br />토모브는 그 경험으로 답을 찾아요.</p>
              </div>
              <div className="pain-vis-wrap">
                <div className="vis-grid3">
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/ecommerce.jpg')"}}><span className="vis-grid-label">이커머스</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/startup.jpg')"}}><span className="vis-grid-label">스타트업</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/ssas.jpg')"}}><span className="vis-grid-label">SaaS</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/fnb.jpg')"}}><span className="vis-grid-label">F&amp;B</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/beauty.jpg')"}}><span className="vis-grid-label">뷰티</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/mcn.jpg')"}}><span className="vis-grid-label">MCN</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/fashion.jpg')"}}><span className="vis-grid-label">패션</span></div>
                  <div className="vis-grid-item" style={{backgroundImage:"url('https://atqznktlipbiuuivczpq.supabase.co/storage/v1/object/public/tomob/content.jpg')"}}><span className="vis-grid-label">콘텐츠</span></div>
                  <div className="vis-grid-item dark">
                    <div className="vis-grid-count">
                      <span className="vis-grid-count-num">+100</span>
                      <span className="vis-grid-count-sub">프로젝트<br />경험</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICE */}
        <section id="service">
          <div className="svc-wrap">
            <div className="rv"><span className="sec-label">06 — Service</span></div>
            <div className="svc-header rv">
              <h2 className="sec-title" style={{marginBottom:0}}>토모브가<br />합니다.</h2>
              <div className="svc-note">
                <p>AI 툴로 빠르게 만들고<br />전문가 감각으로 다듬어요.<br /><strong>속도와 퀄리티를 동시에.</strong></p>
                <div className="ai-strip">
                  <span className="ais">ChatGPT</span><span className="ais">Midjourney</span><span className="ais">Claude</span><span className="ais">Runway</span><span className="ais">Figma AI</span><span className="ais">Framer</span><span className="ais">Sora</span>
                </div>
              </div>
            </div>
            <div className="feature-list rv">
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/z3v3vyw/branding.png')"}}></div></div>
                <div className="feature-title">브랜딩</div>
                <div className="feature-content">BI/CI, 로고, 컨셉 설계까지. 브랜드의 정체성을 처음부터 단단하게 잡아드립니다.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/Fb3f0FJx/uiux.png')"}}></div></div>
                <div className="feature-title">웹/앱 개발</div>
                <div className="feature-content">쇼핑몰, 회사소개, 앱까지. 기획부터 런칭까지 직접 만듭니다.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/WWbXXxSB/content.png')"}}></div></div>
                <div className="feature-title">SNS 콘텐츠</div>
                <div className="feature-content">채널 기획부터 콘텐츠 제작까지. 인스타그램이 팔리는 공간이 되도록 설계합니다.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/SXBZffcy/marketing.png')"}}></div></div>
                <div className="feature-title">마케팅</div>
                <div className="feature-content">퍼포먼스 마케팅과 전략 수립. 쓴 만큼 돌아오는 구조를 만들어드립니다.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/bgrTysjR/product.png')"}}></div></div>
                <div className="feature-title">기획 / PM</div>
                <div className="feature-content">기능정의부터 서비스 플로우까지. 만들기 전에 구조부터 단단하게 잡아드립니다.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/DDCKvNNs/nocode.png')"}}></div></div>
                <div className="feature-title">바이브코딩</div>
                <div className="feature-content">AI와 함께 빠르게 만듭니다. 코드 없이도, 감각은 그대로.</div>
                <div className="feature-line"></div>
              </div>
              <div className="feature">
                <div className="feature-icon"><div className="feature-icon-img" style={{backgroundImage:"url('https://i.ibb.co/bgrTysjR/product.png')"}}></div></div>
                <div className="feature-title">AX 컨설팅</div>
                <div className="feature-content">AI를 어떻게 써야 할지 막막하다면. 업무에 맞는 AI 구조를 설계해드립니다.</div>
                <div className="feature-line"></div>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process">
          <div className="proc-wrap">
            <div className="rv"><span className="sec-label">07 — Process</span></div>
            <h2 className="sec-title rv">이렇게<br />진행됩니다.</h2>
            <div className="proc-grid" id="procGrid">
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 01</span><span className="proc-line"></span></div><div className="proc-name">상담</div><div className="proc-desc">지금 뭐가 필요한지 같이 봅니다</div></div>
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 02</span><span className="proc-line"></span></div><div className="proc-name">진단</div><div className="proc-desc">현재 상태를 솔직하게 짚어드립니다</div></div>
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 03</span><span className="proc-line"></span></div><div className="proc-name">기획</div><div className="proc-desc">방향 잡고 전략 세웁니다</div></div>
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 04</span><span className="proc-line"></span></div><div className="proc-name">제작</div><div className="proc-desc">브랜딩, 디자인, 개발 실행합니다</div></div>
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 05</span><span className="proc-line"></span></div><div className="proc-name">검수</div><div className="proc-desc">넘기기 전에 한 번 더 확인합니다</div></div>
              <div className="proc-item"><div className="proc-badge"><span className="proc-num">STEP 06</span><span className="proc-line"></span></div><div className="proc-name">런칭</div><div className="proc-desc">결과물 전달 + 이후까지 챙깁니다</div></div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta">
          <div className="cta-wrap rv">
            <p className="cta-pretag">Free Consultation</p>
            <div className="cta-big">
              <span className="cta-big-text">contact</span>
              <div className="bi-wrap">
                <div className="bi-box">
                  <svg className="bi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </div>
              </div>
            </div>
            <p className="cta-sub">
              세상을 바꿀 당신의 비즈니스를 위해<br />
              토모브는 새로운 시각과 해결책을 제공합니다.<br />
              무료.
            </p>
            <a href="mailto:contact@tomob.kr" className="cta-btn">무료 상담 신청하기 ›</a>
          </div>
          <div className="cta-contacts">
            <div>
              <div className="ccl">Contact us</div>
              <a href="mailto:contact@tomob.kr" className="ccv">contact@tomob.kr</a>
            </div>
            <div>
              <div className="ccl">Project Contact</div>
              <a href="tel:01068755627" className="ccv">010.6875.5627</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="fi">
            <div>
              <div className="fl-logo">TOMOB<em>.</em></div>
              <div className="fl-tag">방향성부터 봅니다.</div>
              <div className="fl-sns">
                <a href="https://instagram.com/tomob" target="_blank" rel="noopener noreferrer">Instagram</a>
                <div className="fl-div"></div>
                <a href="mailto:contact@tomob.kr">@tomob</a>
              </div>
              <div className="fl-biz">
                서울시 노원구 덕릉로70가길 101 103동 203호<br />
                사업자등록번호 235-75-00550 · 대표 전성은<br />
                브리밍
              </div>
            </div>
          </div>
          <div className="fb">
            <span className="fc">© 2026 TOMOB. All rights reserved.</span>
            <span className="fc">방향성부터 봅니다.</span>
          </div>
        </footer>

      </div>
    </>
  )
}
