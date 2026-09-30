(function () {
  const DATA_ROOT = '/data/';
  async function loadJSON(name) {
    const response = await fetch(DATA_ROOT + name + '.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Nie udało się wczytać danych: ' + name);
    return response.json();
  }
  window.VengrathData = { loadJSON, campaigns: () => loadJSON('campaigns'), players: () => loadJSON('players'), characters: () => loadJSON('characters'), assets: () => loadJSON('assets') };
})();
