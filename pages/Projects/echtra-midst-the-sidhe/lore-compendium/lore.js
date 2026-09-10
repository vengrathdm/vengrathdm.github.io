const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const search = document.querySelector('#lore-search');
const status = document.querySelector('#lore-status');
const title = document.querySelector('#lore-title');
const description = document.querySelector('#lore-description');

const manifestUrl = './articles/index.json';
const articleFolder = './articles/';
const legacyBase = 'https://vengrathdm.github.io/lore-compendium/';
let data = { categories: [], articles: [] };

init();

async function init() {
  try {
    data = normalizeManifest(await fetch(manifestUrl, { cache: 'no-store' }).then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))));
  } catch (error) {
    console.warn('Manifest niedostępny, używam starego indeksu.', error);
    try {
      const legacy = await fetch('./lore.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)));
      data = { categories: legacy.categories || [], articles: (legacy.entries || []).map(([category, entryTitle]) => ({ title: entryTitle, category, file: null, legacy: `${legacy.base || legacyBase}${encodeURIComponent(entryTitle)}/` })) };
    } catch (legacyError) {
      console.error('Lore index error:', legacyError);
      status.textContent = 'BŁĄD ŁADOWANIA';
      root.innerHTML = '<p class="lore-empty">Nie udało się załadować indeksu kompendium.</p>';
      return;
    }
  }

  render('');
  search?.addEventListener('input', event => render(event.target.value));

  const requested = new URLSearchParams(location.search).get('article');
  if (requested) {
    const article = data.articles.find(item => item.file === requested);
    if (article) await loadArticle(article);
  }
}

function normalizeManifest(value) {
  return {
    categories: Array.isArray(value.categories) ? value.categories : [],
    articles: Array.isArray(value.articles) ? value.articles.filter(item => item.title && item.category).map(item => ({ ...item, file: item.file || null })) : []
  };
}

function render(query) {
  const needle = query.trim().toLowerCase();
  const groups = data.categories.map(category => {
    const entries = data.articles.filter(article => article.category === category.id && (!needle || article.title.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    return `<section class="lore-category"><h2 class="lore-category__title">${escapeHtml(category.title || category.label)}</h2><div class="lore-links">${entries.map(article => {
      const href = article.file ? `?article=${encodeURIComponent(article.file)}` : article.legacy;
      const target = article.file ? '' : ' target="_blank" rel="noopener"';
      return `<a href="${href}"${target}><span>${escapeHtml(article.title)}</span><b>↗</b></a>`;
    }).join('')}</div></section>`;
  }).join('');
  root.innerHTML = groups || '<p class="lore-empty">Brak wpisów dla tego wyszukiwania.</p>';
  renderSidebar(needle);
  status.textContent = `${data.articles.filter(article => !needle || article.title.toLowerCase().includes(needle)).length} WPISÓW`;
}

function renderSidebar(needle = '', activeFile = '') {
  if (!sidebar) return;
  sidebar.innerHTML = data.categories.map(category => {
    const entries = data.articles.filter(article => article.category === category.id && (!needle || article.title.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    return `<section class="lore-sidebar__group"><h2>${escapeHtml(category.title || category.label)}</h2>${entries.map(article => {
      const href = article.file ? `?article=${encodeURIComponent(article.file)}` : article.legacy;
      const target = article.file ? '' : ' target="_blank" rel="noopener"';
      const active = article.file === activeFile ? ' is-active' : '';
      return `<a class="${active.trim()}" href="${href}"${target}>${escapeHtml(article.title)}</a>`;
    }).join('')}</section>`;
  }).join('');
}

async function loadArticle(article) {
  try {
    const response = await fetch(articleFolder + encodeURIComponent(article.file), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
    const content = parsed.body?.innerHTML?.trim();
    if (!content) throw new Error('Pusty artykuł');
    document.title = `${article.title} — Echtra — Vengrath`;
    if (title) title.textContent = article.title;
    if (description) description.textContent = 'Wpis kompendium świata Echtra midst the Sidhe.';
    root.innerHTML = `<p><a href="./">← Wszystkie wpisy</a></p>${content}`;
    renderSidebar('', article.file);
    status.textContent = article.title;
  } catch (error) {
    console.error('Lore article error:', error);
    status.textContent = 'BŁĄD ŁADOWANIA';
    root.innerHTML = '<p class="lore-empty">Nie udało się załadować artykułu.</p>';
  }
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
