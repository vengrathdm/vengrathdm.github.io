const root = document.querySelector('#lore-index');
const status = document.querySelector('#lore-status');
const search = document.querySelector('#lore-search');

fetch('./lore.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))).then(data => {
  const render = query => {
    const needle = query.trim().toLowerCase();
    const groups = data.categories.map(category => {
      const entries = data.entries.filter(([id, title]) => id === category.id && (!needle || title.toLowerCase().includes(needle)));
      if (!entries.length) return `<section class="lore-category lore-category--empty"><p class="eyebrow">${escapeHtml(category.label)}</p><p>Warstwa w przygotowaniu.</p></section>`;
      return `<section class="lore-category"><p class="eyebrow">${escapeHtml(category.label)}</p><div class="lore-links">${entries.map(([, title]) => `<a href="${escapeHtml(title)}"><span>${escapeHtml(title)}</span><b>↗</b></a>`).join('')}</div></section>`;
    }).join('');
    root.innerHTML = groups; status.textContent = `${data.entries.length} GOTOWYCH WPISÓW · STRUKTURA W BUDOWIE`;
  };
  render(''); search?.addEventListener('input', e => render(e.target.value));
}).catch(error => { console.error(error); status.textContent = 'BŁĄD ŁADOWANIA'; root.innerHTML = '<p class="project-empty">Nie udało się załadować struktury lore.</p>'; });
function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
