const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const search = document.querySelector('#lore-search');
const status = document.querySelector('#lore-status');
const title = document.querySelector('#lore-title');
const description = document.querySelector('#lore-description');

const articleFolder = './articles/';
const apiFolder = 'https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/pages/Projects/echtra-midst-the-sidhe/lore-compendium/articles?ref=main';
let data = null;
let localArticles = [];

init();

async function init() {
  try {
    data = await fetch('./lore.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)));
    const files = await fetch(apiFolder, { cache: 'no-store' }).then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)));
    localArticles = files.filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html') && file.name !== '_TEMPLATE.html').sort((a,b) => a.name.localeCompare(b.name, 'pl'));
    render('');
    search?.addEventListener('input', event => render(event.target.value));

    const requested = new URLSearchParams(location.search).get('article');
    if (requested) {
      if (localArticles.some(article => article.name === requested)) await loadArticle(requested);
      else showLegacy(requested);
    }
  } catch (error) {
    console.error('Lore index error:', error);
    if (status) status.textContent = 'BŁĄD ŁADOWANIA';
    if (root) root.innerHTML = '<p class="lore-empty">Nie udało się załadować indeksu kompendium.</p>';
  }
}

function render(query) {
  const needle = query.trim().toLowerCase();
  const categories = data.categories.map(category => {
    const entries = data.entries.filter(([id, entryTitle]) => id === category.id && (!needle || entryTitle.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    return `<section class="lore-category"><h2 class="lore-category__title">${escapeHtml(category.label)}</h2><div class="lore-links">${entries.map(([, entryTitle]) => {
      const local = findLocalArticle(entryTitle);
      const href = local ? `?article=${encodeURIComponent(local.name)}` : `${data.base}${encodeURIComponent(entryTitle)}/`;
      const target = local ? '' : ' target="_blank" rel="noopener"';
      return `<a href="${href}"${target}><span>${escapeHtml(entryTitle)}</span><b>↗</b></a>`;
    }).join('')}</div></section>`;
  }).join('');

  root.innerHTML = categories || '<p class="lore-empty">Brak wpisów dla tego wyszukiwania.</p>';
  renderSidebar(needle);
  if (status) status.textContent = `${data.entries.filter(([, entryTitle]) => !needle || entryTitle.toLowerCase().includes(needle)).length} WPISÓW`;
}

function renderSidebar(needle = '', active = '') {
  sidebar.innerHTML = data.categories.map(category => {
    const entries = data.entries.filter(([id, entryTitle]) => id === category.id && (!needle || entryTitle.toLowerCase().includes(needle)));
    if (!entries.length) return '';
    return `<section class="lore-sidebar__group"><h2>${escapeHtml(category.label)}</h2>${entries.map(([, entryTitle]) => {
      const local = findLocalArticle(entryTitle);
      const href = local ? `?article=${encodeURIComponent(local.name)}` : `${data.base}${encodeURIComponent(entryTitle)}/`;
      const target = local ? '' : ' target="_blank" rel="noopener"';
      const isActive = entryTitle === active ? ' is-active' : '';
      return `<a class="${isActive.trim()}" href="${href}"${target}>${escapeHtml(entryTitle)}</a>`;
    }).join('')}</section>`;
  }).join('');
}

async function loadArticle(filename) {
  try {
    const response = await fetch(articleFolder + encodeURIComponent(filename), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const content = parsed.body?.innerHTML?.trim();
    if (!content) throw new Error('Pusty artykuł');
    const articleTitle = articleTitleFromFile(filename);
    document.title = `${articleTitle} — Echtra — Vengrath`;
    if (title) title.textContent = articleTitle;
    if (description) description.textContent = 'Wpis kompendium świata Echtra midst the Sidhe.';
    root.innerHTML = `<p><a href="./">← Wszystkie wpisy</a></p>${content}`;
    renderSidebar('', articleTitle);
    if (status) status.textContent = articleTitle;
  } catch (error) {
    console.error('Lore article error:', error);
    showLegacy(filename);
  }
}

function showLegacy(value) {
  const entry = data.entries.find(([, entryTitle]) => entryTitle === value || slug(entryTitle) === value || `${slug(entryTitle)}.html` === value);
  if (!entry) {
    root.innerHTML = '<p class="lore-empty">Nie znaleziono takiego wpisu.</p>';
    return;
  }
  const entryTitle = entry[1];
  const href = `${data.base}${encodeURIComponent(entryTitle)}/`;
  root.innerHTML = `<p class="lore-empty">Ten wpis korzysta jeszcze z istniejącego archiwum świata.</p><p><a href="${href}" target="_blank" rel="noopener">Otwórz wpis „${escapeHtml(entryTitle)}” ↗</a></p>`;
  if (title) title.textContent = entryTitle;
  if (description) description.textContent = 'Wpis istniejącego archiwum Echtra.';
  renderSidebar('', entryTitle);
  if (status) status.textContent = entryTitle;
}

function findLocalArticle(entryTitle) {
  const wanted = slug(entryTitle);
  return localArticles.find(article => slug(article.name.replace(/\.html$/i, '')) === wanted);
}

function articleTitleFromFile(filename) {
  const local = findLocalArticle(filename.replace(/\.html$/i, '').replace(/[-_]+/g, ' '));
  return local ? data.entries.find(([, entryTitle]) => slug(entryTitle) === slug(filename.replace(/\.html$/i, '')))?.[1] || filename.replace(/\.html$/i, '') : filename.replace(/\.html$/i, '').replace(/[-_]+/g, ' ');
}

function slug(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
