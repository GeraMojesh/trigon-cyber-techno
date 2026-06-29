/**
 * site.js — Trigon Cyber-Tech Full Site Interactivity
 * Handles: Navbar scroll, Scroll animations, Counters, Contact form
 */
import * as API from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. NAVBAR SCROLL EFFECT ────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('hero');

    const updateNavbar = () => {
        if (window.scrollY > 60) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // ── 2. ACTIVE NAV LINK ON SCROLL ──────────────────────────────
    const sections = document.querySelectorAll('section[id], div[id="terminal-section"]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

    // ── 3. FADE-IN ON SCROLL ──────────────────────────────────────
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ── 4. ANIMATED NUMBER COUNTERS ───────────────────────────────
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Hero stats
                entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
                // About metrics
                entry.target.querySelectorAll('.counter').forEach(animateCounter);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.hero-stats, .about-metrics').forEach(el => {
        counterObserver.observe(el);
    });

    // ── 5. SMOOTH SCROLL FOR NAV LINKS ────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ── 6. SERVICE CARD GLOW ON HOVER ─────────────────────────────
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ── 7. CONTACT FORM SUBMISSION ────────────────────────────────
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('form-name')?.value.trim();
        const email = document.getElementById('form-email')?.value.trim();
        const message = document.getElementById('form-message')?.value.trim();

        if (!name || !email || !message) {
            if (formStatus) {
                formStatus.textContent = '⚠ Please fill in all fields.';
                formStatus.className = 'form-status error';
            }
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Transmitting...';
            submitBtn.disabled = true;
        }

        try {
            await API.storeMessage(name, email, message);
            if (formStatus) {
                formStatus.textContent = '✓ Message transmitted successfully.';
                formStatus.className = 'form-status success';
            }
            form.reset();
        } catch (err) {
            if (formStatus) {
                formStatus.textContent = `✗ Transmission failed: ${err.message}`;
                formStatus.className = 'form-status error';
            }
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = '<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
                submitBtn.disabled = false;
            }
        }
    });

    // ── 8. PROJECT PROGRESS BARS ANIMATION ───────────────────────
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.project-progress').forEach(bar => {
                    const targetWidth = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => { bar.style.width = targetWidth; }, 200);
                });
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.projects-grid').forEach(el => {
        progressObserver.observe(el);
    });

});
