import { loadCharacterCatalog } from "/core/templates/CharacterGallery/CharacterRepository.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";
const board = document.querySelector("#board");
const frame = document.querySelector("#gallery-frame");
const search = document.querySelector("#search");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const loadError = document.querySelector("#load-error");
const dialog = document.querySelector("#character-dialog");
const dialogContent = document.querySelector("#dialog-content");
let characters = [];
let achievements = new Map();
let resizeFrame = 0;
const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

function createHtmlElement(name, className, text = "") {
  const element = document.createElementNS(HTML_NS, name);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function polygonPath(points) {
  return `${points
    .map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ")} Z`;
}

function clipPolygon(polygon, normalX, normalY, midpoint) {
  const clipped = [];

  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index];
    const end = polygon[(index + 1) % polygon.length];
    const startDistance = normalX * start.x + normalY * start.y - midpoint;
    const endDistance = normalX * end.x + normalY * end.y - midpoint;
    const startInside = startDistance <= 0;
    const endInside = endDistance <= 0;

    if (startInside) clipped.push(start);

    if (startInside !== endInside) {
      const ratio = startDistance / (startDistance - endDistance);
      clipped.push({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio,
      });
    }
  }

  return clipped;
}

function voronoiCell(site, sites, bounds) {
  let polygon = bounds.map((point) => ({ ...point }));

  for (const other of sites) {
    if (other === site) continue;

    const normalX = other.x - site.x;
    const normalY = other.y - site.y;
    const midpoint =
      (normalX * (other.x + site.x) + normalY * (other.y + site.y)) / 2;

    polygon = clipPolygon(polygon, normalX, normalY, midpoint);
    if (!polygon.length) break;
  }

  return polygon;
}

function makeSites(records, width) {
  const columns =
    width >= 700 ? Math.max(5, Math.floor(width / 172)) : Math.max(1, Math.floor(width / 132));
  const rows = Math.max(1, Math.ceil(records.length / columns));
  const cellWidth = width / columns;
  const cellHeight = Math.max(164, cellWidth * 1.16);
  const sites = [];

  for (let index = 0; index < rows * columns; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const seed = index + 1;
    const jitterX = Math.sin(seed * 12.9898) * cellWidth * 0.16;
    const jitterY = Math.sin(seed * 78.233) * cellHeight * 0.15;

    sites.push({
      character: records[index] || null,
      x: (column + 0.5) * cellWidth + jitterX,
      y: (row + 0.5) * cellHeight + jitterY,
    });
  }

  return { sites, width, height: rows * cellHeight };
}

function createCharacterCell(character, index, sites, bounds) {
  const polygon = voronoiCell(sites[index], sites, bounds);
  if (polygon.length < 3) return null;

  const minX = Math.min(...polygon.map((point) => point.x));
  const maxX = Math.max(...polygon.map((point) => point.x));
  const minY = Math.min(...polygon.map((point) => point.y));
  const maxY = Math.max(...polygon.map((point) => point.y));
  const clipId = `character-clip-${index}`;
  const link = createSvgElement("a", {
    class: "voronoi-cell",
    href: "#character-dialog",
    "aria-label": `${character.character} — ${character.player || "gracz niepodany"}`,
  });
  const clipPath = createSvgElement("clipPath", {
    id: clipId,
    clipPathUnits: "userSpaceOnUse",
  });
  clipPath.append(
    createSvgElement("path", { d: polygonPath(polygon) }),
  );

  const foreignObject = createSvgElement("foreignObject", {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    "clip-path": `url(#${clipId})`,
  });
  const tile = createHtmlElement("div", "voronoi-tile");
  tile.dataset.status = character.status || "";

  const portrait = createHtmlElement("img");
  portrait.src = character.portrait;
  portrait.alt = "";
  portrait.loading = "lazy";
  portrait.decoding = "async";
  portrait.draggable = false;

  const shade = createHtmlElement("div", "voronoi-tile__shade");
  const copy = createHtmlElement("div", "voronoi-tile__copy");
  copy.append(
    createHtmlElement("strong", "voronoi-tile__name", character.character || "Bez nazwy"),
    createHtmlElement("span", "voronoi-tile__player", character.player || "Nie podano"),
  );
  shade.append(copy);
  tile.append(portrait, shade);
  foreignObject.append(tile);

  const outline = createSvgElement("path", {
    class: "voronoi-outline",
    d: polygonPath(polygon),
  });

  link.append(foreignObject, outline);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openCharacter(character);
  });

  return { clipPath, link };
}

function buildGallery() {
  const query = normalize(search.value);
  const filtered = characters.filter((character) => {
    const fields = [
      character.character,
      character.player,
      character.status,
      character.race,
      ...(Array.isArray(character.campaigns) ? character.campaigns : []),
      ...(Array.isArray(character.classes) ? character.classes : []),
    ];

    return normalize(fields.join(" ")).includes(query);
  });

  resultCount.textContent = `${filtered.length} / ${characters.length}`;
  emptyState.hidden = filtered.length > 0;
  board.replaceChildren();
  if (!filtered.length) return;

  const width = Math.max(320, frame.clientWidth);
  const { sites, height } = makeSites(filtered, width);
  const bounds = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  const svg = createSvgElement("svg", {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    role: "group",
    "aria-label": "Postacie",
  });
  const definitions = createSvgElement("defs");
  svg.append(definitions);

  filtered.forEach((character, index) => {
    const cell = createCharacterCell(character, index, sites, bounds);
    if (!cell) return;
    definitions.append(cell.clipPath);
    svg.append(cell.link);
  });

  board.append(svg);
}

function addDetailRow(list, label, value) {
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = Array.isArray(value)
    ? value.join(", ") || "—"
    : value || "—";
  list.append(term, description);
}

function openCharacter(character) {
  const layout = createHtmlElement("div", "dialog-layout");
  const portrait = createHtmlElement("div", "dialog-portrait");
  portrait.dataset.status = character.status || "";

  const image = createHtmlElement("img");
  image.src = character.portrait;
  image.alt = character.character || "Portret postaci";
  portrait.append(image);

  const copy = createHtmlElement("div", "dialog-copy");
  const title = createHtmlElement("h2", "", character.character || "Bez nazwy");
  const player = createHtmlElement("p", "dialog-player", character.player || "Nie podano");
  const details = document.createElement("dl");
  addDetailRow(details, "Status", character.status);
  addDetailRow(details, "Kampanie", character.campaigns);
  addDetailRow(details, "Moduły", character.modules);
  addDetailRow(details, "Klasy", character.classes);
  addDetailRow(details, "Rasa", character.race);

  const awardTerm = document.createElement("dt");
  const awardDescription = document.createElement("dd");
  awardTerm.textContent = "Osiągnięcia";
  const awards = createHtmlElement("div", "dialog-awards");
  const achievementIds = Array.isArray(character.achievementIds)
    ? character.achievementIds
    : character.achievementIds
      ? [character.achievementIds]
      : [];
  const characterAchievements = achievementIds
    .map((id) => achievements.get(id))
    .filter(Boolean);

  if (characterAchievements.length) {
    characterAchievements.forEach((achievement) => {
      awards.append(
        createHtmlElement("span", "dialog-award", achievement.name),
      );
    });
  } else {
    awards.textContent = "—";
  }

  awardDescription.append(awards);
  details.append(awardTerm, awardDescription);
  copy.append(title, player, details);
  layout.append(portrait, copy);
  dialogContent.replaceChildren(layout);
  dialog.showModal();
}

document.querySelector("#dialog-close").addEventListener("click", () => {
  dialog.close();
});
search.addEventListener("input", buildGallery);
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(buildGallery);
});

try {
  const catalog = await loadCharacterCatalog();
  characters = catalog.characters
    .slice()
    .sort((a, b) => String(a.character).localeCompare(String(b.character), "pl"));
  achievements = catalog.achievements;
  buildGallery();
} catch (error) {
  console.error("Nie udało się wczytać galerii Voronoi.", error);
  loadError.hidden = false;
}
