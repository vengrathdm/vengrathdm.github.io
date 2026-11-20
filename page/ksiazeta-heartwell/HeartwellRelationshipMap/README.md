# Heartwell Relationship Map

Standalone GitHub Pages application for the Książęta Heartwell campaign.

## Files

- `index.html` — application shell.
- `styles.css` — Heartwell archive visual system.
- `app.js` — Cytoscape graph, editing workflows, filtering, views and data operations.
- `data/relationships.json` — official published dataset.

## Official data format

The official file and exported files use the same schema:

```json
{
  "schemaVersion": 1,
  "metadata": {
    "id": "heartwell-relationships",
    "name": "Heartwell Relationship Map",
    "updatedAt": "YYYY-MM-DD"
  },
  "entities": [
    {
      "id": "entity-unique-id",
      "type": "Person",
      "name": "Example Person",
      "imageUrl": "https://example.org/portrait.webp",
      "notes": "Markdown-compatible notes.",
      "customFields": [
        { "key": "allegiance", "type": "select", "options": "Crown,Rebels,Neutral" }
      ],
      "fields": {
        "role": "Courtier"
      },
      "positions": {
        "complete": { "x": 120, "y": 80 },
        "family": { "x": 20, "y": 40 }
      }
    }
  ],
  "relationships": [
    {
      "id": "relationship-unique-id",
      "source": "entity-unique-id",
      "target": "another-entity-id",
      "type": "ALLY",
      "note": "Long-form relationship note.",
      "color": "#d4a03c",
      "lineStyle": "solid",
      "direction": "towards"
    }
  ]
}
```

Entity types: `Person`, `Family`, `Faction`, `Object`, `Event`, `Institution`, `Location`. Each type has standard fields, and records may also define typed custom fields (`text`, `number`, `date`, `select`, `checkbox`, `entity`).

Relationship line styles: `solid`, `dotted`, `dashed`. Arrow directions: `none`, `towards`, `from`, `mutual`.

Graphic URLs may point to PNG or WEBP images over HTTP or HTTPS; uploaded PNG/WEBP images are embedded as data URLs and included in exports. Entity positions are stored separately for each graph view. Notes are stored as Markdown source and rendered in the dossier. Custom field definitions are exported alongside their values.

## Publishing edits

The application automatically saves its working copy in browser IndexedDB (with a localStorage fallback), including uploaded images. This local copy is private to that browser and is not a server backup. Use **Export Data** to download the complete working dataset. To publish those changes, replace this repository file with the exported JSON:

`data/relationships.json`

**Save Current View** stores a named graph view, layout, zoom, pan and filters in the working dataset. **Reload Official Data** fetches the published file again and discards the current unexported working copy after confirmation. **Import Data** replaces the current working copy after schema validation.

## Dependencies

Cytoscape.js 3.30.4 is loaded from the unpkg CDN. The application does not modify or depend on the internal implementation of the existing HeartwellMap.
