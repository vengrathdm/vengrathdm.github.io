
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('site-header--scrolled', y > 40);
    if (y > lastY && y > 160) header.classList.add('site-header--compact');
    if (y < lastY) header.classList.remove('site-header--compact');
    lastY = y;
  }, { passive: true });

  const top = document.querySelector('.back-top');
  if (top) top.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
