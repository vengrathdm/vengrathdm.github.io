import { categories, entries } from './data.js';

const state = { category: 'all', query: '', selected: null };
const nav = document.querySelector('#entry-nav');
const contentsGrid = document.querySelector('#contents-grid');
const contentsPanel = document.querySelector('#contents-panel');
const grid = document.querySelector('#entry-grid');
const filters = document.querySelector('#filters');
const count = document.querySelector('#entry-count');
const search = document.querySelector('#search');
const hero = document.querySelector('#compendium-hero');
const view = document.querySelector('#entry-view');
const content = document.querySelector('#entry-content');
const back = document.querySelector('#entry-back');
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#compendium-sidebar');

renderFilters();
renderNavigation();
render();

search?.addEventListener('input', event => {
  state.query = event.target.value.trim().toLowerCase();
  state.selected = null;
  render();
});

filters?.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  state.selected = null;
  renderFilters();
  render();
});

function openEntry(id) {
  state.selected = id;
  render();
  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

nav?.addEventListener('click', event => {
  const link = event.target.closest('[data-entry]');
  if (!link) return;
  event.preventDefault();
  openEntry(link.dataset.entry);
});

contentsGrid?.addEventListener('click', event => {
  const link = event.target.closest('[data-entry]');
  if (!link) return;
  event.preventDefault();
  openEntry(link.dataset.entry);
});

grid?.addEventListener('click', event => {
  const card = event.target.closest('[data-entry]');
  if (!card) return;
  openEntry(card.dataset.entry);
});

back?.addEventListener('click', () => {
  state.selected = null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

menuToggle?.addEventListener('click', () => {
  const open = sidebar?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
});

function getVisibleEntries() {
  return entries.filter(entry => {
    const categoryMatch = state.category === 'all' || entry.category === state.category;
    const haystack = [entry.title, entry.eyebrow, entry.summary, entry.body, ...entry.tags].join(' ').toLowerCase();
    return categoryMatch && (!state.query || haystack.includes(state.query));
  });
}

function renderFilters() {
  if (!filters) return;
  filters.innerHTML = categories.map(category => `
    <button class="filter-button ${state.category === category.id ? 'is-active' : ''}" data-category="${category.id}" type="button">${category.label}</button>
  `).join('');
}

function navigationMarkup() {
  return categories.slice(1).map(category => {
    const categoryEntries = entries.filter(entry => entry.category === category.id);
    if (!categoryEntries.length) return '';
    return `
      <div class="nav-group">
        <button class="nav-group__title" type="button" data-category="${category.id}">${category.label}</button>
        <div class="nav-group__entries">
          ${categoryEntries.map(entry => `<a href="#${entry.id}" data-entry="${entry.id}" class="nav-entry ${state.selected === entry.id ? 'is-active' : ''}">${entry.title}</a>`).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderNavigation() {
  if (nav) nav.innerHTML = navigationMarkup();
  if (contentsGrid) {
    contentsGrid.innerHTML = categories.slice(1).map(category => {
      const categoryEntries = entries.filter(entry => entry.category === category.id);
      if (!categoryEntries.length) return '';
      return `
        <section class="contents-category">
          <button class="contents-category__title" type="button" data-category="${category.id}">${category.label}</button>
          <div class="contents-links">
            ${categoryEntries.map(entry => `<a href="#${entry.id}" data-entry="${entry.id}">${entry.title}<span>→</span></a>`).join('')}
          </div>
        </section>
      `;
    }).join('');
  }
  nav?.querySelectorAll('.nav-group__title').forEach(button => bindCategoryButton(button));
  contentsGrid?.querySelectorAll('.contents-category__title').forEach(button => bindCategoryButton(button));
}

function bindCategoryButton(button) {
  button.addEventListener('click', () => {
    state.category = button.dataset.category;
    state.selected = null;
    renderFilters();
    render();
  });
}

function render() {
  const visible = getVisibleEntries();
  const selected = state.selected ? entries.find(entry => entry.id === state.selected) : null;
  if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'wpis' : 'wpisów'}`;
  renderNavigation();
  if (selected) {
    if (hero) hero.hidden = true;
    if (contentsPanel) contentsPanel.hidden = true;
    if (grid) grid.hidden = true;
    if (view) view.hidden = false;
    renderEntry(selected);
    return;
  }
  if (hero) hero.hidden = false;
  if (contentsPanel) contentsPanel.hidden = true;
  if (grid) grid.hidden = false;
  if (view) view.hidden = true;
  renderGrid(visible);
}

function renderGrid(visible) {
  if (!grid) return;
  if (!visible.length) {
    grid.innerHTML = `<div class="empty-state"><span class="empty-state__mark">✦</span><h3>Nie znaleziono wpisów.</h3><p>Spróbuj innego wyszukiwania albo wróć do wszystkich wpisów.</p></div>`;
    return;
  }
  grid.innerHTML = visible.map(entry => `
    <article class="entry-card" data-entry="${entry.id}" tabindex="0" role="button" aria-label="Otwórz ${entry.title}">
      <span class="entry-card__ornament">✦</span>
      <p class="entry-card__eyebrow">${entry.eyebrow}</p>
      <h3>${entry.title}</h3>
      <p>${entry.summary}</p>
      <div class="entry-card__footer"><span>${entry.tags.slice(0, 2).join(' · ')}</span><span>Czytaj →</span></div>
    </article>
  `).join('');
  grid.querySelectorAll('.entry-card').forEach(card => card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openEntry(card.dataset.entry);
  }));
}

function renderEntry(entry) {
  if (!content) return;
  content.innerHTML = `
    <div class="entry-header">
      <p class="eyebrow">${entry.eyebrow}</p>
      <h2>${entry.title}</h2>
      <p class="entry-lead">${entry.summary}</p>
      <div class="entry-rule"><span>✦</span></div>
    </div>
    <div class="entry-body"><p>${entry.body}</p></div>
    <div class="entry-tags">${entry.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
  `;
}

function closeMobileMenu() {
  sidebar?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}
