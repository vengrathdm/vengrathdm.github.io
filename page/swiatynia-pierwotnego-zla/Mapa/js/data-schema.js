export const CAMPAIGN_SCHEMA_VERSION = 1;

export function normalizeCampaignData(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Dane kampanii muszą być obiektem JSON.");
  if (source.schemaVersion === CAMPAIGN_SCHEMA_VERSION) {
    if (!source.regions || !Array.isArray(source.regions.political) ||
        !Array.isArray(source.regions.geographical) || !Array.isArray(source.markers)) {
      throw new Error("Kampania musi zawierać regions.political, regions.geographical i markers.");
    }
    return { political: source.regions.political, geographical: source.regions.geographical,
      pins: source.markers, pinsEdited: source.markerEdits === true };
  }
  // Migration path for browser drafts and JSON exports created before schemaVersion was introduced.
  if (Array.isArray(source.political) && Array.isArray(source.geographical)) {
    return { political: source.political, geographical: source.geographical,
      pins: Array.isArray(source.pins) ? source.pins : [], pinsEdited: source.pinsEdited === true };
  }
  throw new Error("Nieobsługiwany format danych kampanii. Oczekiwano schemaVersion: 1.");
}

export function createCampaignData(regions, markers, markerEdits, metadata) {
  return { schemaVersion: CAMPAIGN_SCHEMA_VERSION, metadata: metadata || {},
    regions: { political: regions.political, geographical: regions.geographical },
    markers, markerEdits: markerEdits === true };
}
