/** 3D tilt cards, parallax rings, reduced-motion safe */
export function init3DEffects() {
  const cards = document.querySelectorAll('.card-3d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) return;

  cards.forEach((card) => {
    const inner = card.querySelector('.card-3d-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateZ(8px)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    });

    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });

  const rings = document.querySelector('.about-visual');
  if (rings) {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY * 0.08;
        rings.style.transform = `perspective(900px) rotateX(${Math.min(y, 18)}deg)`;
      },
      { passive: true }
    );
  }

  initHeroOrb();
}

function initHeroOrb() {
  const orb = document.getElementById('hero-orb');
  if (!orb || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  const animate = () => {
    frame += 0.008;
    orb.style.transform = `rotateY(${frame * 40}deg) rotateX(${12 + Math.sin(frame) * 6}deg)`;
    requestAnimationFrame(animate);
  };
  animate();
}
