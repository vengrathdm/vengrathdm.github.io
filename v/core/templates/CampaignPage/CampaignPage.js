const CAMPAIGN_FILES = {
  manifest: "./manifest.json",
  theme: "./theme.json",
  content: "./content.json"
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load campaign data: ${path} (${response.status})`);
  }

  const value = await response.json();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Campaign data must be a JSON object: ${path}`);
  }

  return value;
}

/** Load the conventional campaign manifest, theme, and content files together. */
export async function loadCampaignBundle(files = {}) {
  const paths = { ...CAMPAIGN_FILES, ...files };
  const [manifest, theme, content] = await Promise.all(
    Object.values(paths).map(loadJson)
  );

  return { manifest, theme, content };
}

/** Apply the shared campaign theme variables; page CSS remains responsible for layout. */
export function applyCampaignTheme(theme) {
  const root = document.documentElement;

  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    const name = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    root.style.setProperty(`--theme-${name}`, value);
  });

  const fonts = theme.typography || {};
  if (fonts.heading) root.style.setProperty("--theme-font-1", fonts.heading);
  if (fonts.body) root.style.setProperty("--theme-font-2", fonts.body);
  if (fonts.serif) root.style.setProperty("--theme-font-3", fonts.serif);
}
