
(async () => {
  const tbody = document.querySelector('#blog-posts');
  const status = document.querySelector('#blog-status');
  if (!tbody) return;

  try {
    const response = await fetch('./posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`posts.json: HTTP ${response.status}`);
    const posts = await response.json();

    tbody.innerHTML = '';

    if (!posts.length) {
      tbody.innerHTML = '<tr><td colspan="5">Brak wpisów w archiwum.</td></tr>';
      status.textContent = 'ARCHIWUM · 0 WPISÓW';
      return;
    }

    posts.forEach(post => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Data">${escapeHTML(post.date || '—')}</td>
        <td data-label="Wpis"><a class="blog-table__title" href="${safePath(post.url)}">${escapeHTML(post.title)}</a><span class="blog-table__excerpt">${escapeHTML(post.description || '')}</span></td>
        <td data-label="Kategoria">${escapeHTML(post.category || '—')}</td>
        <td data-label="System">${escapeHTML(post.system || '—')}</td>
        <td><a class="blog-table__arrow" href="${safePath(post.url)}" aria-label="Otwórz wpis">→</a></td>
      `;
      tbody.appendChild(tr);
    });

    status.textContent = `ARCHIWUM · ${posts.length} ${posts.length === 1 ? 'WPIS' : 'WPISÓW'}`;
  } catch (error) {
    console.error(error);
    tbody.innerHTML = '<tr><td colspan="5">Nie udało się załadować archiwum. Sprawdź, czy GitHub Action wygenerował <code>posts.json</code>.</td></tr>';
    status.textContent = 'ARCHIWUM · BŁĄD ŁADOWANIA';
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }

  function safePath(value) {
    const normalized = String(value).replace(/^\/+/, '');
    if (!normalized.startsWith('posts/') || normalized.includes('..')) return '#';
    return normalized;
  }
})();
