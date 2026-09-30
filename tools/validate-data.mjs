import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd(); const errors = [];
function read(name) { try { return JSON.parse(fs.readFileSync(path.join(root, 'data', name + '.json'), 'utf8')); } catch (e) { errors.push(name + '.json: ' + e.message); return null; } }
function ids(items, label) { const s = new Set(); for (const x of items || []) { if (!x.id || typeof x.id !== 'string') errors.push(label + ': rekord bez id'); else if (s.has(x.id)) errors.push(label + ': duplikat ' + x.id); else s.add(x.id); } return s; }
const campaigns=read('campaigns'), players=read('players'), characters=read('characters'), assets=read('assets');
const campaignIds=ids(campaigns?.campaigns,'campaigns'), playerIds=ids(players?.players,'players'), characterIds=ids(characters?.characters,'characters'), assetIds=ids(assets?.assets,'assets');
for (const c of characters?.characters || []) { for (const id of c.campaignIds || []) if (!campaignIds.has(id)) errors.push('characters/' + c.id + ': unknown campaign ' + id); if (c.playerId && !playerIds.has(c.playerId)) errors.push('characters/' + c.id + ': unknown player ' + c.playerId); if (c.portraitId && !assetIds.has(c.portraitId)) errors.push('characters/' + c.id + ': unknown asset ' + c.portraitId); }
for (const a of assets?.assets || []) if (!a.path || typeof a.path !== 'string') errors.push('assets/' + a.id + ': missing path');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Walidacja OK. Kampanie: ' + campaignIds.size + '; gracze: ' + playerIds.size + '; postacie: ' + characterIds.size + '; assety: ' + assetIds.size + '.');
