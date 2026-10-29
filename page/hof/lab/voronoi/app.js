import { loadCharacterCatalog } from "/core/templates/CharacterGallery/CharacterRepository.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";
const frame = document.querySelector("#gallery-frame");
const board = document.querySelector("#board");
const search = document.querySelector("#search");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const loadError = document.querySelector("#load-error");
const dialog = document.querySelector("#character-dialog");
const dialogContent = document.querySelector("#dialog-content");

let characters = [];
let achievements = new Map();
let characterById = new Map();
let periodWidth = 0;
let drag = null;
let momentumFrame = 0;
let resizeFrame = 0;
let suppressClickUntil = 0;

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

function makeSites(records, width, height) {
  const rows = Math.max(1, Math.min(6, Math.floor(height / 176)));
  const tileWidth = Math.max(165, Math.min(270, width / 5.2));
  const columns = Math.max(1, Math.ceil(records.length / rows));
  const cellHeight = height / rows;
  const worldWidth = columns * tileWidth;
  const sites = [];

  for (let index = 0; index < columns * rows; index += 1) {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const seed = index + 1;
    const jitterX = Math.sin(seed * 12.9898) * tileWidth * 0.16;
    const jitterY = Math.sin(seed * 78.233) * cellHeight * 0.15;

    sites.push({
      character: records[index] || null,
      x: (column + 0.5) * tileWidth + jitterX,
      y: (row + 0.5) * cellHeight + jitterY,
    });
  }

  return { sites, worldWidth };
}

function createCharacterCopy(character, index, copy, worldWidth, sourcePolygon) {
  const polygon = sourcePolygon.map((point) => ({
    x: point.x + copy * worldWidth,
    y: point.y,
  }));
  if (polygon.length < 3) return null;

  const minX = Math.min(...polygon.map((point) => point.x));
  const maxX = Math.max(...polygon.map((point) => point.x));
  const minY = Math.min(...polygon.map((point) => point.y));
  const maxY = Math.max(...polygon.map((point) => point.y));
  const clipId = `voronoi-clip-${copy}-${index}`;
  const anchor = createSvgElement("a", {
    class: "voronoi-cell",
    href: "#character-dialog",
    "aria-label": `${character.character} — ${character.player || "gracz niepodany"}`,
  });
  anchor.dataset.characterId = character.id || "";

  if (copy !== 1) {
    anchor.setAttribute("aria-hidden", "true");
    anchor.setAttribute("tabindex", "-1");
  }

  const clipPath = createSvgElement("clipPath", {
    id: clipId,
    clipPathUnits: "userSpaceOnUse",
  });
  clipPath.append(createSvgElement("path", { d: polygonPath(polygon) }));

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
  const copyText = createHtmlElement("div", "voronoi-tile__copy");
  copyText.append(
    createHtmlElement(
      "strong",
      "voronoi-tile__name",
      character.character || "Bez nazwy",
    ),
    createHtmlElement(
      "span",
      "voronoi-tile__player",
      character.player || "Nie podano",
    ),
  );
  shade.append(copyText);
  tile.append(portrait, shade);
  foreignObject.append(tile);

  const outline = createSvgElement("path", {
    class: "voronoi-outline",
    d: polygonPath(polygon),
  });

  anchor.append(foreignObject, outline);
  anchor.addEventListener("click", (event) => {
    event.preventDefault();

    if (performance.now() < suppressClickUntil) return;
    openCharacter(character);
  });

  return { clipPath, anchor };
}

function wrapScroll() {
  if (!periodWidth) return;

  if (frame.scrollLeft < periodWidth * 0.25) {
    frame.scrollLeft += periodWidth;
  } else if (frame.scrollLeft > periodWidth * 1.75) {
    frame.scrollLeft -= periodWidth;
  }
}

function renderGallery({ preservePosition = false } = {}) {
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
  if (!filtered.length) {
    periodWidth = 0;
    return;
  }

  const previousPhase =
    periodWidth > 0
      ? ((frame.scrollLeft % periodWidth) + periodWidth) % periodWidth / periodWidth
      : 0;
  const width = Math.max(320, frame.clientWidth);
  const height = Math.max(1, frame.clientHeight);
  const { sites, worldWidth } = makeSites(filtered, width, height);
  const periodicSites = [];

  sites.forEach((site) => {
    periodicSites.push(
      { ...site, x: site.x - worldWidth },
      site,
      { ...site, x: site.x + worldWidth },
    );
  });

  const bounds = [
    { x: -worldWidth, y: 0 },
    { x: 2 * worldWidth, y: 0 },
    { x: 2 * worldWidth, y: height },
    { x: -worldWidth, y: height },
  ];
  const svg = createSvgElement("svg", {
    width: 3 * worldWidth,
    height,
    viewBox: `0 0 ${3 * worldWidth} ${height}`,
    role: "group",
    "aria-label": "Postacie w układzie Voronoi",
  });
  const definitions = createSvgElement("defs");
  svg.append(definitions);

  sites.forEach((site, index) => {
    if (!site.character) return;
    const sourceSite = periodicSites[index * 3 + 1];
    const sourcePolygon = voronoiCell(sourceSite, periodicSites, bounds);

    for (let copy = 0; copy < 3; copy += 1) {
      const card = createCharacterCopy(
        site.character,
        index,
        copy,
        worldWidth,
        sourcePolygon,
      );
      if (!card) continue;

      definitions.append(card.clipPath);
      svg.append(card.anchor);
    }
  });

  board.append(svg);
  periodWidth = worldWidth;
  frame.scrollLeft = worldWidth * (1 + (preservePosition ? previousPhase : 0));
}

function startMomentum(velocity) {
  cancelAnimationFrame(momentumFrame);

  const tick = () => {
    frame.scrollLeft += velocity;
    wrapScroll();
    velocity *= 0.94;

    if (Math.abs(velocity) > 0.15) {
      momentumFrame = requestAnimationFrame(tick);
    }
  };

  if (Math.abs(velocity) > 0.15) {
    momentumFrame = requestAnimationFrame(tick);
  }
}

frame.addEventListener("scroll", wrapScroll, { passive: true });
frame.addEventListener(
  "wheel",
  (event) => {
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;
    if (!delta) return;

    event.preventDefault();
    cancelAnimationFrame(momentumFrame);
    frame.scrollLeft += delta * 1.8;
    wrapScroll();
  },
  { passive: false },
);

frame.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;

  cancelAnimationFrame(momentumFrame);
  drag = {
    startX: event.clientX,
    lastX: event.clientX,
    lastTime: performance.now(),
    velocity: 0,
    moved: false,
    target: event.target.closest?.(".voronoi-cell"),
  };
  frame.setPointerCapture(event.pointerId);
  frame.style.cursor = "grabbing";
});

frame.addEventListener("pointermove", (event) => {
  if (!drag) return;

  const now = performance.now();
  const deltaX = event.clientX - drag.lastX;
  const elapsed = Math.max(1, now - drag.lastTime);

  frame.scrollLeft -= deltaX;
  drag.velocity = (-deltaX / elapsed) * 16;
  drag.moved ||= Math.abs(drag.startX - event.clientX) > 8;
  drag.lastX = event.clientX;
  drag.lastTime = now;
});

function endDrag(event) {
  if (!drag) return;

  const finished = drag;
  drag = null;
  frame.style.cursor = "grab";

  try {
    frame.releasePointerCapture(event.pointerId);
  } catch {
    // Pointer capture may already be released by the browser.
  }

  if (finished.moved) {
    suppressClickUntil = performance.now() + 120;
    startMomentum(finished.velocity);
  } else if (finished.target) {
    suppressClickUntil = performance.now() + 120;
    const character = characterById.get(finished.target.dataset.characterId);
    if (character) openCharacter(character);
  }
}

frame.addEventListener("pointerup", endDrag);
frame.addEventListener("pointercancel", endDrag);
search.addEventListener("input", () => {
  cancelAnimationFrame(momentumFrame);
  renderGallery();
});
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    renderGallery({ preservePosition: true });
  });
});
document.querySelector("#dialog-close").addEventListener("click", () => {
  dialog.close();
});

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
  const player = createHtmlElement(
    "p",
    "dialog-player",
    character.player || "Nie podano",
  );
  const details = document.createElement("dl");
  addDetailRow(details, "Status", character.status);
  addDetailRow(details, "Kampanie", character.campaigns);
  addDetailRow(details, "Moduły", character.modules);
  addDetailRow(details, "Klasy", character.classes);
  addDetailRow(details, "Rasa", character.race);

  const awardTerm = document.createElement("dt");
  const awardDescription = document.createElement("dd");
  const awards = createHtmlElement("div", "dialog-awards");
  awardTerm.textContent = "Osiągnięcia";
  const ids = Array.isArray(character.achievementIds)
    ? character.achievementIds
    : character.achievementIds
      ? [character.achievementIds]
      : [];
  const earned = ids.map((id) => achievements.get(id)).filter(Boolean);

  if (earned.length) {
    earned.forEach((achievement) => {
      awards.append(createHtmlElement("span", "dialog-award", achievement.name));
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

try {
  const catalog = await loadCharacterCatalog();
  characters = catalog.characters
    .slice()
    .sort((a, b) => String(a.character).localeCompare(String(b.character), "pl"));
  characterById = new Map(characters.map((character) => [character.id, character]));
  achievements = catalog.achievements;
  renderGallery();
} catch (error) {
  console.error("Nie udało się wczytać galerii Voronoi.", error);
  loadError.hidden = false;
}
