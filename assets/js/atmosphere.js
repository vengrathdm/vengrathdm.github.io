
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const hero = document.querySelector('.hero');
  const moon = document.querySelector('.moon');
  const lighthouse = document.querySelector('.lighthouse');

  if (!hero) return;

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;

    if (moon) moon.style.transform = `translate(${x * 14}px, ${y * 8}px)`;
    if (lighthouse) lighthouse.style.transform = `translate(${x * -5}px, ${y * -3}px)`;
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    if (moon) moon.style.transform = '';
    if (lighthouse) lighthouse.style.transform = '';
  });
})();
