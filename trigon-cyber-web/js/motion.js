/** Glass polish + team card tilt — reduced-motion safe */

export function initMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return;

  document.querySelectorAll(".team-card.glass3d").forEach((card) => {
    card.addEventListener(
      "mousemove",
      (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
      },
      { passive: true }
    );
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}
