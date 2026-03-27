/**
 * Navigation Module
 * Handles horizontal section scrolling and navigation (desktop)
 * Allows natural vertical scrolling on mobile
 */

(function() {
    'use strict';

    const container = document.getElementById('container');
    const sections = document.querySelectorAll('.section');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressFill = document.getElementById('progressFill');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentIndex = 0;
    let isScrolling = false;
    const totalSections = sections.length;

    /**
     * Check if mobile device
     */
    function isMobile() {
        return window.innerWidth <= 900;
    }

    /**
     * Navigate to specific section
     * @param {number} index - Section index to navigate to
     */
    function goToSection(index) {
        if (index < 0 || index >= totalSections || isScrolling) return;

        // On mobile, scroll to section naturally
        if (isMobile()) {
            sections[index].scrollIntoView({ behavior: 'smooth' });
            return;
        }

        isScrolling = true;
        currentIndex = index;

        // Translate container (desktop only)
        const translateX = -index * 100;
        container.style.transform = `translateX(${translateX}vw)`;

        // Update progress indicator
        progressCurrent.textContent = String(index + 1).padStart(2, '0');
        progressFill.style.width = ((index + 1) / totalSections * 100) + '%';

        // Trigger section-specific animations
        if (window.triggerSectionAnimation) {
            window.triggerSectionAnimation(index);
        }

        // Reset scrolling lock
        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }

    /**
     * Mouse wheel navigation (desktop only)
     */
    document.addEventListener('wheel', (e) => {
        if (isMobile()) return; // Allow natural scroll on mobile

        e.preventDefault();
        if (isScrolling) return;

        if (e.deltaY > 0 || e.deltaX > 0) {
            goToSection(currentIndex + 1);
        } else {
            goToSection(currentIndex - 1);
        }
    }, { passive: false });

    /**
     * Touch navigation (desktop horizontal swipe only)
     */
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        if (isMobile()) return; // Allow natural scroll on mobile
        if (isScrolling) return;

        const diffX = touchStartX - e.changedTouches[0].clientX;
        const diffY = touchStartY - e.changedTouches[0].clientY;

        // Only respond to horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            goToSection(diffX > 0 ? currentIndex + 1 : currentIndex - 1);
        }
    });

    /**
     * Keyboard navigation (desktop only)
     */
    document.addEventListener('keydown', (e) => {
        if (isMobile()) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            goToSection(currentIndex + 1);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            goToSection(currentIndex - 1);
        }
    });

    /**
     * Navigation link clicks
     */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = parseInt(link.getAttribute('data-section'));
            if (!isNaN(sectionIndex)) {
                goToSection(sectionIndex);
            }
        });
    });

    // Export goToSection for external use
    window.goToSection = goToSection;
})();
