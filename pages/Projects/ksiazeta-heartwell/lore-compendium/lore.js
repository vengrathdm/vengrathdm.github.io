const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const status = document.querySelector('#lore-status');
const search = document.querySelector('#lore-search');

const apiFolder = 'https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/pages/Projects/ksiazeta-heartwell/lore-compendium/articles?ref=main';
const manifestUrl = './articles/index.json';
const articleFolder = './articles/';

let articles = [];

loadArticles();

async function loadArticles() {
  try {
    articles = await loadFromApi();
  } catch (apiError) {
    console.warn('GitHub API niedostępne, używam lokalnego indeksu artykułów.', apiError);
    try {
      articles = await loadFromManifest();
    } catch (manifestError) {
      console.error('Lore index error:', manifestError);
      if (status) status.textContent = 'NIE UDAŁO SIĘ ZAŁADOWAĆ';
      if (root) root.innerHTML = '<p class="lore-empty">Nie udało się odczytać listy artykułów.</p>';
      return;
    }
  }

  renderIndex();
  search?.addEventListener('input', renderIndex);

  const requestedArticle = new URLSearchParams(location.search).get('article');
  if (requestedArticle) {
    const article = articles.find(item => item.name === requestedArticle);
    if (article) loadArticle(article.name);
    else if (status) status.textContent = 'NIE ZNALEZIONO';
  }
}

async function loadFromApi() {
  const response = await fetch(apiFolder, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const files = await response.json();
  return files
    .filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html') && file.name !== '_TEMPLATE.html')
    .map(file => ({ name: file.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

async function loadFromManifest() {
  const response = await fetch(manifestUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const files = await response.json();
  return files
    .filter(name => typeof name === 'string' && name.toLowerCase().endsWith('.html') && name !== '_TEMPLATE.html')
    .map(name => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

function renderIndex() {
  const needle = (search?.value || '').trim().toLowerCase();
  const filtered = articles.filter(article => displayTitle(article.name).toLowerCase().includes(needle));
  const links = filtered.map(article => {
    const title = displayTitle(article.name);
    return `<a href="?article=${encodeURIComponent(article.name)}"><span>${escapeHtml(title)}</span><b>↗</b></a>`;
  }).join('');

  root.innerHTML = links
    ? `<section class="lore-category"><div class="lore-links">${links}</div></section>`
    : '<p class="lore-empty">Brak artykułów.</p>';

  sidebar.innerHTML = filtered.map(article => {
    const title = displayTitle(article.name);
    return `<section class="lore-sidebar__group"><a href="?article=${encodeURIComponent(article.name)}">${escapeHtml(title)}</a></section>`;
  }).join('') || '<p class="lore-empty">Brak artykułów.</p>';

  if (status) status.textContent = `${filtered.length} artykułów`;
}

async function loadArticle(filename) {
  try {
    const response = await fetch(articleFolder + encodeURIComponent(filename), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const documentFragment = new DOMParser().parseFromString(html, 'text/html');
    const content = documentFragment.body?.innerHTML?.trim();
    if (!content) throw new Error('Pusty artykuł');

    const title = displayTitle(filename);
    document.title = `${title} — Heartwell — Vengrath`;
    root.innerHTML = `<article class="project-copy lore-article"><p><a href="./">← Wszystkie artykuły</a></p>${content}</article>`;
    renderSidebar(title);
    if (status) status.textContent = title;
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'BŁĄD ŁADOWANIA';
    if (root) root.innerHTML = '<p class="lore-empty">Nie udało się załadować artykułu.</p>';
  }
}

function renderSidebar(activeTitle) {
  sidebar.innerHTML = articles.map(article => {
    const title = displayTitle(article.name);
    const active = title === activeTitle ? ' is-active' : '';
    return `<section class="lore-sidebar__group"><a class="${active.trim()}" href="?article=${encodeURIComponent(article.name)}">${escapeHtml(title)}</a></section>`;
  }).join('');
}

function displayTitle(filename) {
  return filename
    .replace(/\.html$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
