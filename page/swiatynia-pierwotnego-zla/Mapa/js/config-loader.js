export async function loadMapConfiguration() {
  const paths = { map: "./config/map.json", layers: "./config/layers.json", editor: "./config/editor.json" };
  const entries = await Promise.all(Object.entries(paths).map(async ([key, path]) => {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error("Nie udało się wczytać konfiguracji " + key + " (HTTP " + response.status + ").");
    return [key, await response.json()];
  }));
  const config = Object.fromEntries(entries);
  if (!config.map?.dimensions || !config.map?.projection || !config.layers?.layerOrder || !config.editor?.brush) {
    throw new Error("Konfiguracja mapy ma nieprawidłową strukturę.");
  }
  return config;
}
