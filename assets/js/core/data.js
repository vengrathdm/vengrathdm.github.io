export async function loadJson(path) {
  const url = new URL(path, document.baseURI);
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`${path}: HTTP ${response.status}`);
  }

  return response.json();
}

export function requireArray(value, sourceName) {
  if (!Array.isArray(value)) {
    throw new Error(`${sourceName} nie zawiera tablicy.`);
  }

  return value;
}
