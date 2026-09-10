const gallery = document.querySelector('#illustration-gallery');
const api = 'https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/illustrations/graphics?ref=main';

async function loadIllustrations() {
  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const files = await response.json();
    const images = files.filter(file => /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name));
    if (!images.length) { gallery.innerHTML = '<p class="project-empty">Brak ilustracji do wyświetlenia.</p>'; return; }
    gallery.replaceChildren(...images.map((file, index) => {
      const card = document.createElement('a');
      card.className = 'project-card';
      card.href = file.download_url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.innerHTML = `<span class="project-card__number">${String(index + 1).padStart(2,'0')}</span><span class="project-card__type">ILLUSTRATION</span><h3>${escapeHtml(file.name.replace(/\.[^.]+$/, ''))}</h3><span class="project-card__arrow">OTWÓRZ ↗</span>`;
      return card;
    }));
  } catch (error) {
    console.error('Illustration gallery error:', error);
    gallery.innerHTML = '<p class="project-empty">Nie udało się załadować galerii.</p>';
  }
}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
loadIllustrations();
