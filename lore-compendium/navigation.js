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
  ['irgaelia', 'Irgaela', 'Irgaela'], ['irgaelia', 'Ludzie i Plemiona', 'Ludzie i Plemiona'], ['irgaelia', 'Miejsca i Regiony', 'Miejsca i Regiony'], ['irgaelia', 'Miejsca Mocy i Święte Miejsca', 'Miejsca Mocy i Święte Miejsca'], ['irgaelia', 'Kultura i Tradycje', 'Kultura i Tradycje'],
  ['divinities', 'Historia Bogów', 'Historia Bogów'], ['divinities', 'Dagda', 'Dagda'], ['divinities', 'Danu', 'Danu'], ['divinities', 'Brigid', 'Brigid'], ['divinities', 'Lugh', 'Lugh'], ['divinities', 'Cernunnos', 'Cernunnos'], ['divinities', 'Morrigan', 'Morrigan'], ['divinities', 'Manannán', 'Manannán'], ['divinities', 'Cailleach', 'Cailleach'],
  ['sidhe', 'Inny Świat', 'Inny Świat'], ['sidhe', 'Sidhe', 'Sidhe'], ['sidhe', 'Seelie i Unseelie', 'Seelie i Unseelie'], ['sidhe', 'Dwór Zimy', 'Dwór Zimy'], ['sidhe', 'Dwór Wiosny', 'Dwór Wiosny'], ['sidhe', 'Dwór Lata', 'Dwór Lata'], ['sidhe', 'Dwór Jesieni', 'Dwór Jesieni'],
  ['fomorian', 'Historia Fomorian', 'Historia Fomorian'], ['fomorian', 'Balor Złego Oka', 'Balor Złego Oka'], ['fomorian', 'Osmandias Stormeye', 'Osmandias Stormeye'], ['fomorian', 'Ceithleen o Krzywych Zębach', 'Ceithleen o Krzywych Zębach'],
  ['wyrms', 'Pierwotne Wyrmy Irgaeli', 'Pierwotne Wyrmy Irgaeli'], ['wyrms', 'Caoránach, Mroźny Wyrm', 'Caoránach, Mroźny Wyrm'], ['wyrms', 'Cruimheach, Magmowy Wyrm', 'Cruimheach, Magmowy Wyrm'], ['wyrms', 'Féileacánach, Kryształowy Wyrm', 'Féileacánach, Kryształowy Wyrm'], ['wyrms', 'Cnagach, Piorunowy Wyrm', 'Cnagach, Piorunowy Wyrm'],
  ['magical-beings', 'Tressym', 'Tressym'], ['magical-beings', 'Hagi', 'Hagi'], ['magical-beings', 'Demony', 'Demony'], ['magical-beings', 'Cienie', 'Cienie'], ['magical-beings', 'Feniksy', 'Feniksy'],
  ['magic-items', 'Srebrna Dłoń Nuady', 'Srebrna Dłoń Nuady'], ['magic-items', 'Auric Edge', 'Auric Edge'], ['magic-items', 'Claíomh Solais', 'Claíomh Solais'], ['magic-items', 'Fragarach, Odwetnik', 'Fragarach, Odwetnik'], ['magic-items', 'Osiem Boskich Broni', 'Osiem Boskich Broni'],
  ['magic-materials', 'Zimne Żelazo', 'Zimne Żelazo'], ['magic-materials', 'Orichalcum', 'Orichalcum'], ['magic-materials', 'Starmetal', 'Starmetal']
];

const pathFor = title => `${encodeURIComponent(title)}/`;
const currentTitle = document.body.dataset.article || '';
const nav = document.querySelector('#entry-nav');
const search = document.querySelector('#search');
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#compendium-sidebar');
const contentsGrid = document.querySelector('#contents-grid');
const entryGrid = document.querySelector('#entry-grid');

function renderNavigation(filter = '') {
  const needle = filter.trim().toLowerCase();
  if (nav) {
    nav.innerHTML = categories.map(category => {
      const items = entries.filter(([id]) => id === category.id && (!needle || [arguments[0]].join('').toLowerCase()));
      const filtered = entries.filter(([id, title]) => id === category.id && (!needle || title.toLowerCase().includes(needle)));
      if (!filtered.length) return '';
      return `<div class="nav-group"><div class="nav-group__title">${category.label}</div><div class="nav-group__entries">${filtered.map(([, title]) => `<a href="${pathFor(title)}" class="nav-entry ${title === currentTitle ? 'is-active' : ''}" ${title === currentTitle ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</div></div>`;
    }).join('');
  }
}

function renderIndex(filter = '') {
  if (!entryGrid) return;
  const needle = filter.trim().toLowerCase();
  entryGrid.innerHTML = categories.map(category => {
    const filtered = entries.filter(([id, title]) => id === category.id && (!needle || title.toLowerCase().includes(needle)));
    if (!filtered.length) return '';
    return `<section class="contents-category"><p class="eyebrow">${category.label}</p><div class="contents-links">${filtered.map(([, title]) => `<a href="${pathFor(title)}">${title}<span>→</span></a>`).join('')}</div></section>`;
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
