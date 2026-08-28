const categories = [
  { id: 'irgaelia', label: 'Irgaela' },
  { id: 'divinities', label: 'Bóstwa' },
  { id: 'sidhe', label: 'Sidhe i Inny Świat' },
  { id: 'fomorian', label: 'Fomorianie' },
  { id: 'wyrms', label: 'Wielkie Wyrmy' },
  { id: 'magical-beings', label: 'Istoty magiczne' },
  { id: 'magic-items', label: 'MAGICZNE PRZEDMIOTY' },
  { id: 'magic-materials', label: 'MAGICZNE MATERIAŁY' }
];

const entries = [
  ['irgaelia', 'Irgaela'], ['irgaelia', 'Ludzie i Plemiona'], ['irgaelia', 'Miejsca i Regiony'], ['irgaelia', 'Miejsca Mocy i Święte Miejsca'], ['irgaelia', 'Kultura i Tradycje'],
  ['divinities', 'Historia Bogów'], ['divinities', 'Dagda'], ['divinities', 'Danu'], ['divinities', 'Brigid'], ['divinities', 'Lugh'], ['divinities', 'Cernunnos'], ['divinities', 'Morrigan'], ['divinities', 'Manannán'], ['divinities', 'Cailleach'],
  ['sidhe', 'Inny Świat'], ['sidhe', 'Sidhe'], ['sidhe', 'Seelie i Unseelie'], ['sidhe', 'Dwór Zimy'], ['sidhe', 'Dwór Wiosny'], ['sidhe', 'Dwór Lata'], ['sidhe', 'Dwór Jesieni'],
  ['fomorian', 'Historia Fomorian'], ['fomorian', 'Balor Złego Oka'], ['fomorian', 'Osmandias Stormeye'], ['fomorian', 'Ceithleen o Krzywych Zębach'],
  ['wyrms', 'Pierwotne Wyrmy Irgaeli'], ['wyrms', 'Caoránach, Mroźny Wyrm'], ['wyrms', 'Cruimheach, Magmowy Wyrm'], ['wyrms', 'Féileacánach, Kryształowy Wyrm'], ['wyrms', 'Cnagach, Piorunowy Wyrm'],
  ['magical-beings', 'Tressym'], ['magical-beings', 'Hagi'], ['magical-beings', 'Demony'], ['magical-beings', 'Cienie'], ['magical-beings', 'Feniksy'],
  ['magic-items', 'Srebrna Dłoń Nuady'], ['magic-items', 'Auric Edge'], ['magic-items', 'Claíomh Solais'], ['magic-items', 'Fragarach, Odwetnik'], ['magic-items', 'Osiem Boskich Broni'],
  ['magic-materials', 'Zimne Żelazo'], ['magic-materials', 'Orichalcum'], ['magic-materials', 'Starmetal']
];

// Article URLs are rooted at /lore-compendium/, not relative to the current article folder.
const compendiumRoot = new URL('../', window.location.href);
const pathFor = title => {
  const url = new URL(`${encodeURIComponent(title)}/`, compendiumRoot);
  return url.pathname;
};

const currentTitle = document.body.dataset.article || '';
const nav = document.querySelector('#entry-nav');
const search = document.querySelector('#search');
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#compendium-sidebar');
const entryGrid = document.querySelector('#entry-grid');

function filteredEntries(filter = '') {
  const needle = filter.trim().toLowerCase();
  return entries.filter(([, title]) => !needle || title.toLowerCase().includes(needle));
}

function renderNavigation(filter = '') {
  if (!nav) return;
  const visible = filteredEntries(filter);
  nav.innerHTML = categories.map(category => {
    const categoryEntries = visible.filter(([id]) => id === category.id);
    if (!categoryEntries.length) return '';
    return `<div class="nav-group"><div class="nav-group__title">${category.label}</div><div class="nav-group__entries">${categoryEntries.map(([, title]) => `<a href="${pathFor(title)}" class="nav-entry ${title === currentTitle ? 'is-active' : ''}" ${title === currentTitle ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</div></div>`;
  }).join('');
}

function renderIndex(filter = '') {
  if (!entryGrid) return;
  const visible = filteredEntries(filter);
  entryGrid.innerHTML = categories.map(category => {
    const categoryEntries = visible.filter(([id]) => id === category.id);
    if (!categoryEntries.length) return '';
    return `<section class="contents-category"><p class="eyebrow">${category.label}</p><div class="contents-links">${categoryEntries.map(([, title]) => `<a href="${pathFor(title)}">${title}<span>→</span></a>`).join('')}</div></section>`;
  }).join('');
}

renderNavigation();
renderIndex();

search?.addEventListener('input', event => {
  renderNavigation(event.target.value);
  renderIndex(event.target.value);
});

menuToggle?.addEventListener('click', () => {
  const open = sidebar?.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
});
