const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'CLOSE' : 'MENU';
  });
}

addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 20), { passive: true });

const currentPath = location.pathname.replace(/\\/g, '/');
document.querySelectorAll('.site-nav a').forEach(link => {
  const target = new URL(link.href, location.href).pathname.replace(/\\/g, '/');
  if (target !== '/' && currentPath.startsWith(target)) link.setAttribute('aria-current', 'page');
});

document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(900px) rotateX(${y * -2}deg) rotateY(${x * 2}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

const searchTrigger = document.querySelector('[data-global-search]');
if (searchTrigger) initGlobalSearch(searchTrigger);

function initGlobalSearch(trigger) {
  let dialog, input, results, items = [], loaded = false;
  trigger.addEventListener('click', async () => {
    if (!dialog) { dialog = buildSearchDialog(); input = dialog.querySelector('.global-search__input'); results = dialog.querySelector('.global-search__results'); }
    dialog.hidden = false; document.body.classList.add('search-open'); input.focus();
    if (!loaded) {
      results.innerHTML = '<p class="global-search__status">Ładowanie indeksu…</p>';
      try {
        const response = await fetch(new URL('/search-index.json', location.origin), { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        items = await response.json(); loaded = true; renderResults('');
      } catch (error) { console.error('Global search error:', error); results.innerHTML = '<p class="global-search__status">Indeks wyszukiwania jest chwilowo niedostępny.</p>'; }
    }
  });

  function buildSearchDialog() {
    const overlay = document.createElement('div'); overlay.className = 'global-search'; overlay.hidden = true;
    overlay.innerHTML = `<div class="global-search__dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title"><div class="global-search__top"><div><p class="eyebrow">[ INDEX / SEARCH ]</p><h2 id="global-search-title">Znajdź w <em>atelier.</em></h2></div><button class="global-search__close" type="button" aria-label="Zamknij wyszukiwanie">×</button></div><label class="global-search__field"><span class="sr-only">Szukaj</span><input class="global-search__input" type="search" placeholder="Projekt, kampania, post, lore…" autocomplete="off"></label><div class="global-search__results" aria-live="polite"></div></div>`;
    overlay.querySelector('.global-search__close').addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    overlay.querySelector('.global-search__input').addEventListener('input', event => renderResults(event.target.value));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
    document.body.append(overlay); return overlay;
  }

  function renderResults(query) {
    const needle = query.trim().toLowerCase();
    const matches = items.filter(item => !needle || `${item.title} ${item.description} ${item.type} ${item.tags?.join(' ')}`.toLowerCase().includes(needle)).slice(0, 24);
    if (!matches.length) { results.innerHTML = '<p class="global-search__status">Brak wyników.</p>'; return; }
    results.replaceChildren(...matches.map(item => {
      const link = document.createElement('a'); link.className = 'global-search__result'; link.href = item.url;
      link.innerHTML = `<span class="global-search__result-type">${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description || '')}</span>`; return link;
    }));
  }
  function close() { dialog.hidden = true; document.body.classList.remove('search-open'); }
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
