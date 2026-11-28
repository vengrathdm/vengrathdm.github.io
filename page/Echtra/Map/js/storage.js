export function readJson(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch (error) { console.warn("Nie udało się odczytać lokalnego zapisu:", error); return null; }
}
export function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { console.warn("Nie udało się zapisać lokalnego zapisu:", error); return false; }
}
