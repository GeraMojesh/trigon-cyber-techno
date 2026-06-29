import * as API from './api.js';
import { SITE } from './content.js';
import {
  renderAbout,
  renderProjects,
  renderServices,
  renderShortcuts,
  renderSpatialCards,
  renderTeam,
} from './render.js';
import { init3DEffects } from './effects-3d.js';

document.addEventListener('DOMContentLoaded', () => {
  renderShortcuts();
  renderAbout();
  renderServices();
  renderTeam();
  renderProjects();
  renderSpatialCards();
  init3DEffects();
  initNavbar();
  initFadeIn();
  initCounters();
  initContactForm();
  initMobileNav();
});

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
        }
      });
    },
    { threshold: 0.35 }
  );
  document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('nav-toggle')?.setAttribute('aria-expanded', 'false');
        document.getElementById('nav-menu')?.classList.remove('open');
      }
    });
  });
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function initFadeIn() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

function initCounters() {
  const animate = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.counter').forEach(animate);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.about-metrics').forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value.trim();
    const email = document.getElementById('form-email')?.value.trim();
    const message = document.getElementById('form-message')?.value.trim();
    if (!name || !email || !message) {
      status.textContent = 'Please fill in all fields.';
      status.className = 'form-status error';
      return;
    }
    status.textContent = 'Sending...';
    status.className = 'form-status';
    try {
      const result = await API.storeMessage(name, email, message);
      status.textContent = result || 'Message sent. We will respond shortly.';
      status.className = 'form-status success';
      form.reset();
    } catch {
      status.textContent = 'Unable to send. Try again or email us directly.';
      status.className = 'form-status error';
    }
  });
}
