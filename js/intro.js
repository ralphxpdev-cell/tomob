/**
 * Intro Animation Module
 * Handles the opening curtain animation and initial element reveals
 */

(function() {
    'use strict';

    const introCurtain = document.getElementById('introCurtain');
    const header = document.getElementById('header');
    const progress = document.getElementById('progress');
    const footer = document.getElementById('footer');
    const heroTitle = document.getElementById('heroTitle');
    const heroTagline = document.getElementById('heroTagline');
    const heroSub = document.getElementById('heroSub');
    const heroScroll = document.getElementById('heroScroll');

    // Intro animation sequence
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Open curtain
            introCurtain.classList.add('open');

            setTimeout(() => {
                // Show header, progress, and footer
                header.classList.add('show');
                progress.classList.add('show');
                footer.classList.add('show');

                // Animate hero title
                heroTitle.classList.add('show');

                // Stagger remaining hero elements
                setTimeout(() => {
                    heroTagline.classList.add('show');
                }, 200);

                setTimeout(() => {
                    heroSub.classList.add('show');
                }, 400);

                setTimeout(() => {
                    heroScroll.classList.add('show');
                }, 600);
            }, 800);
        }, 500);
    });
})();
