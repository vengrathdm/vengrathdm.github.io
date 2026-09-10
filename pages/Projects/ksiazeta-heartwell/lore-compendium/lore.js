const root = document.querySelector('#lore-index');
const sidebar = document.querySelector('#lore-sidebar-groups');
const status = document.querySelector('#lore-status');
const search = document.querySelector('#lore-search');
const articleFolder = './articles/';

loadArticles();

async function loadArticles() {
  try {
    const response = await fetch('https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/pages/Projects/ksiazeta-heartwell/lore-compendium/articles?ref=main', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const files = await response.json();
    const articles = files
      .filter(file => file.type === 'file' && file.name.toLowerCase().endsWith('.html') && file.name !== '_TEMPLATE.html')
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    render(articles);
    search?.addEventListener('input', () => render(articles));
  } catch (error) {
    console.error(error);
    if (status) status.textContent = 'NIE UDAŁO SIĘ ZAŁADOWAĆ';
    if (root) root.innerHTML = '<p class="lore-empty">Nie udało się odczytać listy artykułów.</p>';
  }
}

function render(articles) {
  const needle = (search?.value || '').trim().toLowerCase();
  const filtered = articles.filter(article => displayTitle(article.name).toLowerCase().includes(needle));

  const links = filtered.map(article => {
    const title = displayTitle(article.name);
    return `<a href="${articleFolder}${encodeURIComponent(article.name)}"><span>${escapeHtml(title)}</span><b>↗</b></a>`;
  }).join('');

  root.innerHTML = links
    ? `<section class="lore-category"><div class="lore-links">${links}</div></section>`
    : '<p class="lore-empty">Brak artykułów.</p>';

  sidebar.innerHTML = filtered.map(article => {
    const title = displayTitle(article.name);
    return `<section class="lore-sidebar__group"><a href="${articleFolder}${encodeURIComponent(article.name)}">${escapeHtml(title)}</a></section>`;
  }).join('') || '<p class="lore-empty">Brak artykułów.</p>';

  if (status) status.textContent = `${filtered.length} artykułów`;
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
