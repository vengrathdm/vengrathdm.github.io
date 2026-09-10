const root = document.querySelector('#lore-index');
const search = document.querySelector('#lore-search');
const status = document.querySelector('#lore-status');

fetch('./lore.json', { cache: 'no-store' })
  .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
  .then(data => {
    const render = query => {
      const needle = query.trim().toLowerCase();
      const groups = data.categories.map(category => {
        const entries = data.entries.filter(([id, title]) => id === category.id && (!needle || title.toLowerCase().includes(needle)));
        if (!entries.length) return '';
        return `<section class="lore-category"><p class="eyebrow">${escapeHtml(category.label)}</p><div class="lore-links">${entries.map(([, title]) => `<a href="${data.base}${encodeURIComponent(title)}/" target="_blank" rel="noopener"><span>${escapeHtml(title)}</span><b>↗</b></a>`).join('')}</div></section>`;
      }).join('');
      root.innerHTML = groups || '<p class="project-empty">Brak wpisów dla tego wyszukiwania.</p>';
      status.textContent = `${data.entries.filter(([, title]) => !needle || title.toLowerCase().includes(needle)).length} WPISÓW`;
    };
    render('');
    search?.addEventListener('input', event => render(event.target.value));
  })
  .catch(error => { console.error('Lore index error:', error); status.textContent = 'BŁĄD ŁADOWANIA'; root.innerHTML = '<p class="project-empty">Nie udało się załadować indeksu lore.</p>'; });

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
