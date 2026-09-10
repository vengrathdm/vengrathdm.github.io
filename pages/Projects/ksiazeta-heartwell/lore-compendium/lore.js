const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const status = document.querySelector('#lore-status');
const search = document.querySelector('#lore-search');

const apiFolder = 'https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/pages/Projects/ksiazeta-heartwell/lore-compendium/articles?ref=main';
const manifestUrl = './articles/index.json';
const articleFolder = './articles/';

let manifest = { categories: [], articles: [] };

loadArticles();

async function loadArticles() {
  try {
    manifest = await loadManifest();
  } catch (manifestError) {
    try {
      manifest = await loadFromApi();
    } catch (apiError) {
      console.error('Lore index error:', manifestError, apiError);
      if (status) status.textContent = 'NIE UDAŁO SIĘ ZAŁADOWAĆ';
      if (root) root.innerHTML = '<p class="lore-empty">Nie udało się odczytać listy artykułów.</p>';
      return;
    }
  }

  renderIndex();
  search?.addEventListener('input', renderIndex);

  const requestedArticle = new URLSearchParams(location.search).get('article');
  if (requestedArticle) {
    const article = manifest.articles.find(item => item.file === requestedArticle);
    if (article) loadArticle(article);
    else if (status) status.textContent = 'NIE ZNALEZIONO';
  }
}

async function loadManifest() {
  const response = await fetch(manifestUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return normalizeManifest(await response.json());
}

async function loadFromApi() {
  const response = await fetch(apiFolder, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const files = await response.json();
  return normalizeManifest({
    categories: [{ id: 'inne', title: 'Pozostałe' }],
    articles: files
      .filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html') && file.name !== '_TEMPLATE.html')
      .map(file => ({ file: file.name, title: displayTitle(file.name), category: 'inne' }))
  });
}

function normalizeManifest(data) {
  if (Array.isArray(data)) {
    return { categories: [{ id: 'inne', title: 'Pozostałe' }], articles: data.map(file => ({ file, title: displayTitle(file), category: 'inne' })) };
  }
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    articles: Array.isArray(data.articles) ? data.articles.filter(article => article.file && article.category) : []
  };
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

function articleLink(article) {
  return `<a href="?article=${encodeURIComponent(article.file)}"><span>${escapeHtml(article.title)}</span><b>↗</b></a>`;
}

async function loadArticle(article) {
  try {
    const response = await fetch(articleFolder + encodeURIComponent(article.file), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const documentFragment = new DOMParser().parseFromString(html, 'text/html');
    const content = documentFragment.body?.innerHTML?.trim();
    if (!content) throw new Error('Pusty artykuł');

    document.title = `${article.title} — Heartwell — Vengrath`;
    root.innerHTML = `<article class="project-copy lore-article"><p><a href="./">← Wszystkie artykuły</a></p>${content}</article>`;
    renderSidebar();
    sidebar.querySelectorAll('a').forEach(link => { if (link.getAttribute('href')?.includes(encodeURIComponent(article.file))) link.classList.add('is-active'); });
    if (status) status.textContent = article.title;
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'BŁĄD ŁADOWANIA';
    root.innerHTML = '<p class="lore-empty">Nie udało się załadować artykułu.</p>';
  }
}

function displayTitle(filename) {
  return filename.replace(/\.html$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}
