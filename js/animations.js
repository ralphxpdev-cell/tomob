/**
 * Section Animations Module
 * Handles animations that trigger when entering specific sections
 */

(function() {
    'use strict';

    /**
     * Trigger animations for specific sections
     * @param {number} index - Section index
     */
    window.triggerSectionAnimation = function(index) {
        switch(index) {
            case 1:
                animateAboutSection();
                break;
            // Add more section animations here as needed
            default:
                break;
        }
    };

    /**
     * About section animation
     */
    function animateAboutSection() {
        const aboutLabel = document.querySelector('.about-label');
        const aboutTitle = document.querySelector('.about-title');
        const aboutDescs = document.querySelectorAll('.about-desc');

        if (!aboutLabel || !aboutTitle) return;

        // Stagger animations
        setTimeout(() => {
            aboutLabel.classList.add('show');
        }, 100);

        setTimeout(() => {
            aboutTitle.classList.add('show');
        }, 200);

        aboutDescs.forEach((desc, i) => {
            setTimeout(() => {
                desc.classList.add('show');
            }, 400 + i * 100);
        });
    }

    /**
     * Add intersection observer for more efficient animations
     * (Optional enhancement for future improvements)
     */
    function initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, options);

        // Observe sections or specific elements
        const observableElements = document.querySelectorAll('.section');
        observableElements.forEach(el => observer.observe(el));
    }

    // Initialize intersection observer on load
    // Uncomment to enable
    // window.addEventListener('load', initIntersectionObserver);
})();
