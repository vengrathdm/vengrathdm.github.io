(function () {
  const cache = new Map();
  async function getAssets() { if (!cache.has('assets')) cache.set('assets', window.VengrathData.assets()); return cache.get('assets'); }
  async function asset(id) { const data = await getAssets(); const record = data.assets.find(item => item.id === id); if (!record) throw new Error('Nieznany asset: ' + id); return record.path; }
  window.VengrathAssets = { asset };
})();
