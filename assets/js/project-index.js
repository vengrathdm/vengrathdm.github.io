import { loadJson, requireArray } from './core/data.js';
import { createElement, clear, showMessage } from './core/dom.js';

const catalog = document.querySelector('#project-catalog');
const filters = document.querySelector('#project-filters');

if (catalog) loadProjects().catch(handleError);

async function loadProjects() {
  const projects = requireArray(await loadJson('./projects.json'), 'projects.json');
  renderProjects(projects, 'all');
  setupFilters(projects);
}

function setupFilters(projects) {
  if (!filters) return;

  filters.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      filters.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      renderProjects(projects, button.dataset.filter);
    });
  });
}

function renderProjects(projects, filter) {
  const visible = projects.filter(project => {
    if (filter === 'legacy') return project.legacy === true;
    if (filter === 'active') return project.legacy !== true;
    return true;
  });

  clear(catalog);
  if (!visible.length) {
    showMessage(catalog, 'Brak projektów do wyświetlenia.');
    return;
  }

  visible.forEach(project => catalog.append(createProjectCard(project)));
}

function createProjectCard(project) {
  return createElement('a', {
    className: 'project-card',
    href: project.url,
    children: [
      createElement('span', { className: 'project-card__type', text: project.type || 'PROJEKT' }),
      createElement('h3', { text: project.title || 'Bez tytułu' }),
      createElement('p', { text: project.system || '' }),
      createElement('span', { className: 'project-card__status', text: project.status || '' }),
      createElement('span', { className: 'project-card__arrow', text: 'Otwórz projekt →' })
    ]
  });
}

function handleError(error) {
  console.error('Project catalog error:', error);
  showMessage(catalog, 'Nie udało się załadować katalogu projektów. Sprawdź, czy projects.json jest dostępny.');
}
