const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const status = document.querySelector('#lore-status');
const search = document.querySelector('#lore-search');
const manifestUrl = './articles/index.json';
const articleFolder = './articles/';
let manifest = { categories: [], articles: [] };

loadArticles();

async function loadArticles() {
  try {
    manifest = normalizeManifest(await fetch(manifestUrl, { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))));
    renderIndex();
    search?.addEventListener('input', renderIndex);
    const requested = new URLSearchParams(location.search).get('article');
    if (requested) {
      const article = manifest.articles.find(item => item.file === requested);
      if (article) loadArticle(article);
    }
  } catch (error) {
    console.error('Lore index error:', error);
    if (status) status.textContent = 'NIE UDAŁO SIĘ ZAŁADOWAĆ';
    if (root) root.innerHTML = '<p class="lore-empty">Nie udało się odczytać listy artykułów.</p>';
  }
}

function normalizeManifest(data) {
  if (Array.isArray(data)) return { categories: [{ id: 'inne', title: 'Pozostałe' }], articles: data.map(file => ({ file, title: displayTitle(file), category: 'inne' })) };
  return { categories: Array.isArray(data.categories) ? data.categories : [], articles: Array.isArray(data.articles) ? data.articles.filter(article => article.file && article.category) : [] };
}

function renderIndex() {
  const needle = (search?.value || '').trim().toLowerCase();
  let total = 0;
  const groups = manifest.categories.map(category => {
    const entries = manifest.articles.filter(article => article.category === category.id && (!needle || article.title.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    total += entries.length;
    return `<section class="lore-category"><h2 class="lore-category__title">${escapeHtml(category.title)}</h2><div class="lore-links">${entries.map(articleLink).join('')}</div></section>`;
  }).join('');
  root.innerHTML = groups || '<p class="lore-empty">Brak artykułów.</p>';
  renderSidebar(needle);
  if (status) status.textContent = `${total} artykułów`;
}

function renderSidebar(needle = '') {
  sidebar.innerHTML = manifest.categories.map(category => {
    const entries = manifest.articles.filter(article => article.category === category.id && (!needle || article.title.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    return `<section class="lore-sidebar__group"><h2>${escapeHtml(category.title)}</h2>${entries.map(article => `<a href="?article=${encodeURIComponent(article.file)}">${escapeHtml(article.title)}</a>`).join('')}</section>`;
  }).join('') || '<p class="lore-empty">Brak artykułów.</p>';
}

function articleLink(article) { return `<a href="?article=${encodeURIComponent(article.file)}"><span>${escapeHtml(article.title)}</span><b>↗</b></a>`; }

async function loadArticle(article) {
  try {
    const response = await fetch(articleFolder + encodeURIComponent(article.file), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
    const content = parsed.body?.innerHTML?.trim();
    if (!content) throw new Error('Pusty artykuł');
    document.title = `${article.title} — Heartwell — Vengrath`;
    root.innerHTML = `<article class="project-copy lore-article"><p><a href="./">← Wszystkie artykuły</a></p>${content}</article>`;
    renderSidebar();
    sidebar.querySelectorAll('a').forEach(link => { if (link.getAttribute('href')?.includes(encodeURIComponent(article.file))) link.classList.add('is-active'); });
    if (status) status.textContent = article.title;
    if (article.file === 'mapa-heartwell.html') initHeartwellMap();
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'BŁĄD ŁADOWANIA';
    root.innerHTML = '<p class="lore-empty">Nie udało się załadować artykułu.</p>';
  }
}

function initHeartwellMap() {
  const map = root.querySelector('[data-map-root]');
  if (!map || map.dataset.initialized === 'true') return;
  map.dataset.initialized = 'true';

  const viewport = map.querySelector('[data-map-viewport]');
  const canvas = map.querySelector('[data-map-canvas]');
  const image = map.querySelector('.heartwell-map__image');
  const details = map.querySelector('[data-map-details]');
  const markers = [...map.querySelectorAll('[data-location]')];
  const minZoom = 1;
  const maxZoom = 3.2;
  let zoom = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let pointerId = null;
  let startPointerX = 0;
  let startPointerY = 0;
  let startX = 0;
  let startY = 0;

  const places = {
    wisielcze: { title: 'Wisielcze Wzgórze', type: 'Dzielnica', text: 'Dzielnica Javerta Crane’a, związana z gniewem, prawem i rygorystyczną procedurą.', link: 'wisielcze-wzgorze.html' },
    korona: { title: 'Korona', type: 'Dzielnica', text: 'Dzielnica Percivala. Centrum władzy, elegancji i najważniejszych symboli Mrocznego Lorda.', link: 'korona.html' },
    senatorium: { title: 'Senatorium', type: 'Dzielnica', text: 'Dzielnica Isadory Crane, zbudowana wokół odpoczynku, leczenia, komfortu i snu.', link: 'senatorium.html' },
    erozja: { title: 'Erozja', type: 'Dzielnica', text: 'Dzielnica Vivienne Duskmere i Matthiasa Ravencrofta, związana z zazdrością, pożądaniem, sztuką i religią.', link: 'erozja.html' },
    apetoria: { title: 'Apetoria', type: 'Dzielnica', text: 'Dzielnica Heleny Corvus. Handel, kultura, jedzenie, rozrywka i walka o kontrolę nad rynkami.', link: 'apetoria.html' },
    zabraniec: { title: 'Zabraniec', type: 'Dzielnica', text: 'Dzielnica Sabine Kessler, w której władza opiera się na kapitale, długach, kontraktach i zobowiązaniach.', link: 'zabraniec.html' },
    port: { title: 'Port rzeczny', type: 'Lokacja', text: 'Południowy kraniec Heartwell. Miasto rozciąga się od Wisielczego Wzgórza na północy po doki nad rzeką na południu.', link: 'heartwell-miasto.html' }
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function bounds() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const cw = canvas.offsetWidth * zoom;
    const ch = canvas.offsetHeight * zoom;
    const maxX = Math.max(0, (cw - vw) / 2);
    const maxY = Math.max(0, (ch - vh) / 2);
    return { maxX, maxY };
  }

  function applyTransform() {
    const { maxX, maxY } = bounds();
    x = clamp(x, -maxX, maxX);
    y = clamp(y, -maxY, maxY);
    canvas.style.transform = `translate3d(${x}px,${y}px,0) scale(${zoom})`;
  }

  function setZoom(next, focusX = viewport.clientWidth / 2, focusY = viewport.clientHeight / 2) {
    const oldZoom = zoom;
    zoom = clamp(next, minZoom, maxZoom);
    if (zoom === oldZoom) return;
    const ratio = zoom / oldZoom;
    x = focusX - (focusX - x) * ratio;
    y = focusY - (focusY - y) * ratio;
    applyTransform();
  }

  function selectPlace(id) {
    const place = places[id];
    if (!place) return;
    markers.forEach(marker => marker.classList.toggle('is-active', marker.dataset.location === id));
    details.innerHTML = `<div class="heartwell-map__details-card"><p class="heartwell-map__details-type">${escapeHtml(place.type)}</p><h2>${escapeHtml(place.title)}</h2><p>${escapeHtml(place.text)}</p><a href="./?article=${encodeURIComponent(place.link)}">Otwórz artykuł ↗</a></div>`;
  }

  markers.forEach(marker => marker.addEventListener('click', () => selectPlace(marker.dataset.location)));

  map.querySelector('[data-map-zoom="in"]')?.addEventListener('click', () => setZoom(zoom + .35));
  map.querySelector('[data-map-zoom="out"]')?.addEventListener('click', () => setZoom(zoom - .35));
  map.querySelector('[data-map-reset]')?.addEventListener('click', () => { zoom = 1; x = 0; y = 0; applyTransform(); });

  viewport.addEventListener('wheel', event => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    setZoom(zoom + (event.deltaY < 0 ? .18 : -.18), event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });

  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) return;
    dragging = true;
    pointerId = event.pointerId;
    startPointerX = event.clientX;
    startPointerY = event.clientY;
    startX = x;
    startY = y;
    viewport.setPointerCapture(pointerId);
    viewport.classList.add('is-dragging');
  });

  viewport.addEventListener('pointermove', event => {
    if (!dragging || event.pointerId !== pointerId) return;
    x = startX + event.clientX - startPointerX;
    y = startY + event.clientY - startPointerY;
    applyTransform();
  });

  function stopDrag() {
    dragging = false;
    pointerId = null;
    viewport.classList.remove('is-dragging');
  }

  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('pointerleave', event => { if (dragging && event.buttons === 0) stopDrag(); });

  viewport.addEventListener('keydown', event => {
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(zoom + .25); }
    if (event.key === '-') { event.preventDefault(); setZoom(zoom - .25); }
    if (event.key === '0') { event.preventDefault(); zoom = 1; x = 0; y = 0; applyTransform(); }
  });

  image.addEventListener('load', applyTransform, { once: true });
  applyTransform();
}

function displayTitle(filename) { return filename.replace(/\.html$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char])); }
