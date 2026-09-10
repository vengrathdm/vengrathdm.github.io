const catalog = document.querySelector('#project-catalog');
const filters = document.querySelector('#project-filters');

if (catalog) {
  fetch('./projects.json')
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(projects => {
      render(projects, 'all');
      filters?.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
        filters.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
        render(projects, button.dataset.filter);
      }));
    })
    .catch(error => {
      console.error('Project catalog error:', error);
      catalog.innerHTML = '<p class="project-empty">Nie udało się załadować katalogu projektów.</p>';
    });
}

function render(projects, filter) {
  const visible = projects.filter(project => {
    if (filter === 'legacy') return project.legacy;
    if (filter === 'active') return !project.legacy && project.status !== 'KIEDYŚ';
    return true;
  });
  catalog.replaceChildren(...visible.map((project, index) => card(project, index)));
}

function card(project, index) {
  const link = document.createElement('a');
  link.className = `project-card${project.legacy ? ' project-card--legacy' : ''}`;
  link.href = project.url;
  link.innerHTML = `<span class="project-card__number">${String(index + 1).padStart(2, '0')}</span><span class="project-card__type">${escapeHtml(project.type)}</span><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.system)}</p><span class="project-card__status">${escapeHtml(project.status)}</span><span class="project-card__arrow">OTWÓRZ PROJEKT ↗</span>`;
  return link;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
