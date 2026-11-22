import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#scene");
const loading = $("#loading");
const fallback = $("#fallback");
const intro = $(".intro");
const hint = $("#interaction-hint");
const searchInput = $("#archive-search");
const searchFeedback = $("#search-feedback");
const drawerPanel = $("#drawer-panel");
const drawerTitle = $("#drawer-title");
const drawerCode = $("#drawer-code");
const drawerDescription = $("#drawer-description");
const drawerCount = $("#drawer-count");
const drawerContents = $("#drawer-contents");
const drawerPosition = $("#drawer-position");
const markDrawerButton = $("#mark-drawer");
const reader = $("#reader");
const css3dContainer = $("#css3d-container");
const readerLabel = $("#reader-label");
const markIssueButton = $("#mark-issue");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STORE_KEYS = {
  drawers: "vengrath.archive.marked-drawers.v2",
  gazettes: "vengrath.archive.marked-gazettes.v2"
};
function readSet(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return new Set(); }
}
const markedDrawers = readSet(STORE_KEYS.drawers);
const markedGazettes = readSet(STORE_KEYS.gazettes);
function persistMarks() {
  try {
    localStorage.setItem(STORE_KEYS.drawers, JSON.stringify([...markedDrawers]));
    localStorage.setItem(STORE_KEYS.gazettes, JSON.stringify([...markedGazettes]));
  } catch (error) {
    console.warn("Archive marks could not be saved in this browser.", error);
  }
}

let manifest;
let drawers = [];
let gazettes = [];
let drawerById = new Map();
let gazettesByDrawer = new Map();
const gazetteVolumes = new Map();
let renderer, cssRenderer, cssScene, scene, camera, controls, raycaster, pointer, cabinetRoot;
let drawerObjects = [];
let activeDrawerId = null;
let activeGazette = null;
let gazetteMotion = null;
let activeVolume = null;
let volumeDrag = null;
let pageDrag = null;
let markedOnly = false;
let query = "";
let pointerStart = null;
let hoveredObject = null;
const clock = new THREE.Clock();

const materials = {
  walnut: new THREE.MeshStandardMaterial({ color: 0x382519, roughness: .73 }),
  walnutDark: new THREE.MeshStandardMaterial({ color: 0x21150f, roughness: .82 }),
  walnutEdge: new THREE.MeshStandardMaterial({ color: 0x60402a, roughness: .62 }),
  brass: new THREE.MeshStandardMaterial({ color: 0x997242, metalness: .78, roughness: .34 }),
  brassLight: new THREE.MeshStandardMaterial({ color: 0xc49b5e, metalness: .72, roughness: .29 }),
  black: new THREE.MeshStandardMaterial({ color: 0x171411, roughness: .38, metalness: .3 }),
  paper: new THREE.MeshStandardMaterial({ color: 0xd9c7a7, roughness: .92 }),
  paperDark: new THREE.MeshStandardMaterial({ color: 0xb6a17f, roughness: .9 }),
  shadow: new THREE.MeshStandardMaterial({ color: 0x100d0a, roughness: 1 })
};

function box(parent, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = options.cast ?? true;
  mesh.receiveShadow = options.receive ?? true;
  if (options.name) mesh.name = options.name;
  parent.add(mesh);
  return mesh;
}

function makeCanvasTexture(width, height, painter) {
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  painter(ctx, width, height);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
  return { surface, ctx, texture };
}

function labelTexture(drawer, isMarked = false) {
  return makeCanvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#d8c8a8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#b6a27f";
    ctx.fillRect(0, 0, 14, h);
    ctx.fillStyle = "rgba(56,38,23,.16)";
    ctx.fillRect(17, 10, w - 28, 2);
    ctx.fillRect(17, h - 12, w - 28, 2);
    ctx.fillStyle = "#34271c";
    ctx.font = "500 23px 'DM Mono', monospace";
    ctx.fillText(drawer.code, 30, 48);
    ctx.font = "500 32px 'DM Mono', monospace";
    const label = drawer.label.toUpperCase();
    let shown = label;
    while (ctx.measureText(shown).width > 365) shown = shown.slice(0, -1);
    ctx.fillText(shown, 30, 91);
    if (isMarked) {
      ctx.fillStyle = "#8d3028";
      ctx.font = "bold 43px serif";
      ctx.fillText("✦", 445, 79);
    }
  });
}

function createPageViewport(entry, side) {
  const element = document.createElement("div");
  element.className = "physical-page " + side;
  element.style.visibility = "hidden";
  const frame = document.createElement("iframe");
  frame.title = entry.title + " — " + side + " page";
  frame.loading = "eager";
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
  frame.src = "about:blank";
  const edge = document.createElement("div");
  edge.className = "page-edge";
  const grip = document.createElement("button");
  grip.type = "button";
  grip.className = "page-flip-grip " + side;
  grip.setAttribute("aria-label", side === "right" ? "Hold and drag the page left to turn forward" : "Hold and drag the page right to turn backward");
  grip.title = side === "right" ? "Hold and drag left to turn page" : "Hold and drag right to turn page";
  element.append(edge, frame, grip);
  const object = new CSS3DObject(element);
  object.visible = false;
  object.scale.setScalar(.0045);
  cssScene.add(object);
  return { element, iframe: frame, object, grip };
}

function createGazetteVolume(entry, drawerGroup, slot) {
  const coverArt = makeCanvasTexture(128, 192, (ctx, w, h) => {
    ctx.fillStyle = "#71302a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c5a16c";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeRect(11, 11, w - 22, h - 22);
    ctx.fillStyle = "#e8d4ad";
    ctx.textAlign = "center";
    ctx.font = "8px monospace";
    ctx.fillText("HEARTWELL", w / 2, 34);
    ctx.fillText(entry.issue.replace("NO. ", "No. ").slice(0, 19), w / 2, 48);
    ctx.strokeStyle = "rgba(222,195,143,.7)";
    ctx.beginPath(); ctx.moveTo(24, 59); ctx.lineTo(w - 24, 59); ctx.stroke();
    const words = entry.title.toUpperCase().split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width > 88 && line) { lines.push(line); line = word; }
      else line = candidate;
    }
    if (line) lines.push(line);
    ctx.font = "bold 11px Georgia";
    lines.slice(0, 5).forEach((text, i) => ctx.fillText(text, w / 2, 85 + i * 14));
    ctx.fillStyle = "#d2b27d";
    ctx.font = "6px monospace";
    ctx.fillText("MUNICIPAL PRESS", w / 2, h - 24);
    ctx.fillText("1926", w / 2, h - 14);
  });
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0x743029, roughness: .7 });
  const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xe2d5bd, roughness: .96 });
  const coverArtMaterial = new THREE.MeshStandardMaterial({ map: coverArt.texture, roughness: .82 });
  const book = new THREE.Group();
  book.userData.gazetteSlug = entry.slug;
  book.userData.drawerId = entry.drawer;

  // Distinct cover, binding and paper block, plus two shallow page surfaces.
  box(book, [4.82, 4.66, .30], [0, 0, -.08], redMaterial);
  box(book, [4.64, 4.48, .14], [0, 0, .055], materials.paper);
  box(book, [.12, 4.55, .13], [0, 0, .07], materials.walnutEdge);
  for (const side of [-1, 1]) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(2.34, 4.3), paperMaterial);
    leaf.position.set(side * 1.17, 0, .19);
    book.add(leaf);
  }

  const coverPivot = new THREE.Group();
  coverPivot.position.set(0, 0, .14);
  book.add(coverPivot);
  box(coverPivot, [2.34, 4.49, .065], [1.17, 0, 0], redMaterial);
  const coverLabel = new THREE.Mesh(new THREE.PlaneGeometry(2.08, 4.03), coverArtMaterial);
  coverLabel.position.set(1.17, 0, .041);
  coverPivot.add(coverLabel);

  // Each record owns two independent, initially unloaded HTML page viewports.
  const left = createPageViewport(entry, "left");
  const right = createPageViewport(entry, "right");

  // A two-sided page is rotated around the book's central spine during a turn.
  const flipElement = document.createElement("div");
  flipElement.className = "physical-flip-sheet";
  const front = document.createElement("div");
  front.className = "flip-face flip-front";
  const back = document.createElement("div");
  back.className = "flip-face flip-back";
  const frontFrame = document.createElement("iframe");
  const backFrame = document.createElement("iframe");
  for (const frame of [frontFrame, backFrame]) {
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
    frame.src = "about:blank";
  }
  frontFrame.title = entry.title + " — turning page front";
  backFrame.title = entry.title + " — turning page reverse";
  front.append(frontFrame);
  back.append(backFrame);
  flipElement.append(front, back);
  const flipObject = new CSS3DObject(flipElement);
  flipObject.position.x = 1.17;
  flipObject.scale.setScalar(.0045);
  const flipPivot = new THREE.Group();
  flipPivot.visible = false;
  flipPivot.add(flipObject);
  cssScene.add(flipPivot);

  const column = slot % 5;
  const depthRow = Math.floor(slot / 5);
  book.position.set(-.42 + column * .21, -.08, -.29 - depthRow * .13);
  book.scale.setScalar(.041);
  book.visible = false;
  drawerGroup.add(book);

  const volume = {
    entry, book, coverPivot, left, right, flipPivot, flipObject,
    flipFront: frontFrame, flipBack: backFrame, drawerGroup,
    localPosition: book.position.clone(),
    localQuaternion: book.quaternion.clone(),
    localScale: book.scale.clone(),
    originPosition: null, originQuaternion: null, originScale: null,
    pages: null, spread: 0, turning: false, pageTurn: null
  };
  left.grip.addEventListener("pointerdown", (event) => beginPageDrag(volume, -1, event));
  right.grip.addEventListener("pointerdown", (event) => beginPageDrag(volume, 1, event));
  gazetteVolumes.set(entry.slug, volume);
  return volume;
}

function createDrawer(drawer, index, column, row) {
  const group = new THREE.Group();
  group.userData.drawerId = drawer.id;
  group.userData.index = index;
  const width = 1.16;
  const height = .55;
  const depth = .84;

  box(group, [width - .035, height - .04, .13], [0, 0, .01], materials.walnutEdge);
  box(group, [width - .12, .045, depth], [0, -height * .45, -depth / 2], materials.walnutDark);
  box(group, [.045, height - .09, depth], [-width * .47, 0, -depth / 2], materials.walnutEdge);
  box(group, [.045, height - .09, depth], [width * .47, 0, -depth / 2], materials.walnutEdge);
  box(group, [width - .12, .04, depth], [0, height * .43, -depth / 2], materials.walnutEdge);

  const filed = gazettesByDrawer.get(drawer.id) || [];
  if (filed.length) {
    filed.forEach((entry, n) => createGazetteVolume(entry, group, n));
  } else {
    for (let n = 0; n < 5; n++) {
      const card = box(group, [.105, .31 + (n % 2) * .035, .34], [-.43 + n * .19, -.025, -.28 - (n % 2) * .035], n % 3 === 0 ? materials.paperDark : materials.paper, { cast: false });
      card.rotation.y = (n - 2) * .035;
      box(group, [.07, .012, .012], [-.43 + n * .19, .105, -.095], materials.brass, { cast: false });
    }
  }

  const face = box(group, [width, .22, .14], [0, -.16, .12], materials.walnut);
  face.userData.drawerId = drawer.id;
  face.userData.pickable = true;
  const facePlate = box(group, [.93, .12, .025], [0, -.15, .198], materials.brass);
  facePlate.userData.drawerId = drawer.id;
  facePlate.userData.pickable = true;
  const label = labelTexture(drawer, markedDrawers.has(drawer.id));
  const labelMat = new THREE.MeshStandardMaterial({ map: label.texture, roughness: .95 });
  const labelMesh = box(group, [.79, .072, .014], [0, -.15, .218], labelMat, { cast: false });
  labelMesh.userData.drawerId = drawer.id;
  labelMesh.userData.pickable = true;

  const recess = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .025, 32), materials.black);
  recess.rotation.x = Math.PI / 2;
  recess.position.set(0, -.235, .222);
  group.add(recess);
  const pull = new THREE.Mesh(new THREE.TorusGeometry(.066, .012, 8, 28), materials.brassLight);
  pull.position.set(0, -.235, .245);
  group.add(pull);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(.021, 12, 8), materials.brassLight);
  pin.position.set(0, -.235, .253);
  group.add(pin);
  for (const sx of [-.43, .43]) {
    for (const sy of [-.22, -.08]) {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .012, 12), materials.brassLight);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(sx, sy, .22);
      group.add(screw);
    }
  }

  const pitchX = 1.255;
  const pitchY = .665;
  group.position.set((column - 2) * pitchX, 1.77 - row * pitchY, .045);
  group.userData.openZ = .88;
  group.userData.targetZ = 0;
  group.userData.labelTexture = label;
  group.userData.labelMaterial = labelMat;
  group.userData.face = face;
  group.userData.index = index;
  group.userData.drawerId = drawer.id;
  group.traverse((child) => {
    if (child.isMesh && child.geometry.type === "BoxGeometry") child.userData.drawerId = drawer.id;
  });
  cabinetRoot.add(group);
  drawerObjects.push(group);
  return group;
}

function addRoom() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x28211a, roughness: .94 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.04;
  floor.receiveShadow = true;
  scene.add(floor);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 12),
    new THREE.MeshStandardMaterial({ color: 0x211a14, roughness: 1 })
  );
  backWall.position.set(0, 5.5, -3.1);
  scene.add(backWall);

  const sideWall = box(scene, [.18, 7.5, 12], [-8.8, 3.7, -1], materials.walnutDark);
  sideWall.material = new THREE.MeshStandardMaterial({ color: 0x17120e, roughness: 1 });
  box(scene, [18, .12, .2], [0, .04, -2.7], materials.walnutEdge);
  box(scene, [18, .12, .2], [0, 7.4, -2.7], materials.walnutEdge);

  // Tall wall mouldings and the archival sign behind the cabinet.
  for (let x = -7; x <= 8; x += 2.5) {
    box(scene, [.035, 7.2, .035], [x, 3.65, -3.04], materials.brass, { cast: false });
  }
  const sign = makeCanvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = "#21170f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#a7834e";
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = "rgba(190,155,99,.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(31, 31, w - 62, h - 62);
    ctx.fillStyle = "#d4bd94";
    ctx.textAlign = "center";
    ctx.font = "38px 'DM Mono', monospace";
    ctx.fillText("HEARTWELL MUNICIPAL ARCHIVE", w / 2, 103);
    ctx.font = "italic 34px 'Cormorant Garamond', serif";
    ctx.fillStyle = "#b99c70";
    ctx.fillText("PERIODICALS & PUBLIC RECORDS", w / 2, 166);
  });
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.1),
    new THREE.MeshStandardMaterial({ map: sign.texture, roughness: .9 })
  );
  signMesh.position.set(1.1, 5.07, -2.97);
  scene.add(signMesh);

  // Wall lantern, intentionally subdued so the brass remains legible.
  const lampBack = box(scene, [.5, .08, .35], [1.1, 6.0, -2.7], materials.brass);
  const lantern = new THREE.PointLight(0xe4b878, 65, 13, 2);
  lantern.position.set(1.1, 5.7, -1.1);
  scene.add(lantern);
  const fill = new THREE.PointLight(0x8c6c48, 24, 12, 2);
  fill.position.set(-4.2, 3.5, 1.8);
  scene.add(fill);
}

function addCabinet() {
  cabinetRoot = new THREE.Group();
  cabinetRoot.position.set(1.18, 2.23, -1.75);
  scene.add(cabinetRoot);

  // Large oak carcass with thick side stiles and top crown.
  box(cabinetRoot, [6.75, 4.48, 1.25], [0, 0, -.59], materials.walnutDark);
  box(cabinetRoot, [6.93, .18, 1.45], [0, 2.29, -.55], materials.walnutEdge);
  box(cabinetRoot, [6.93, .17, 1.45], [0, -2.29, -.55], materials.walnutEdge);
  box(cabinetRoot, [.17, 4.42, 1.4], [-3.38, 0, -.55], materials.walnutEdge);
  box(cabinetRoot, [.17, 4.42, 1.4], [3.38, 0, -.55], materials.walnutEdge);
  box(cabinetRoot, [6.6, 4.32, .045], [0, 0, .075], materials.walnutDark);
  box(cabinetRoot, [6.55, .08, .12], [0, 2.17, .11], materials.brass);
  box(cabinetRoot, [6.55, .08, .12], [0, -2.17, .11], materials.brass);

  // Recessed field around the drawers.
  box(cabinetRoot, [6.45, 4.18, .08], [0, 0, .15], materials.black);
  for (let c = 1; c < 5; c++) {
    box(cabinetRoot, [.055, 4.02, .11], [(c - 2.5) * 1.255, 0, .19], materials.walnutEdge);
  }
  for (let r = 1; r < 6; r++) {
    box(cabinetRoot, [6.42, .055, .11], [0, 1.77 - (r - .5) * .665, .19], materials.walnutEdge);
  }

  const cols = 5;
  for (let i = 0; i < drawers.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    createDrawer(drawers[i], i, col, row);
  }

  // Small feet and brass corner rosettes.
  for (const x of [-3.05, 3.05]) {
    for (const z of [-.95, .02]) {
      box(cabinetRoot, [.28, .26, .28], [x, -2.5, z], materials.walnutDark);
    }
  }
  for (const x of [-3.28, 3.28]) {
    for (const y of [-2.14, 2.14]) {
      const stud = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), materials.brassLight);
      stud.position.set(x, y, .16);
      cabinetRoot.add(stud);
    }
  }
}

function drawerMatches(drawer) {
  if (markedOnly) {
    const savedIssue = (gazettesByDrawer.get(drawer.id) || []).some((entry) => markedGazettes.has(entry.slug));
    if (!markedDrawers.has(drawer.id) && !savedIssue) return false;
  }
  if (!query) return true;
  const text = [
    drawer.label, drawer.code, drawer.description,
    ...(gazettesByDrawer.get(drawer.id) || []).flatMap((entry) => [
      entry.title, entry.issue, entry.date, entry.excerpt, ...(entry.tags || [])
    ])
  ].join(" ").toLocaleLowerCase();
  return text.includes(query);
}

function issueMatches(entry) {
  if (markedOnly && !markedDrawers.has(entry.drawer) && !markedGazettes.has(entry.slug)) return false;
  if (!query) return true;
  const drawer = drawerById.get(entry.drawer);
  return [
    entry.title, entry.issue, entry.date, entry.excerpt,
    ...(entry.tags || []), drawer?.label || "", drawer?.description || ""
  ].join(" ").toLocaleLowerCase().includes(query);
}

function updateLabel(drawer) {
  const object = drawerObjects.find((item) => item.userData.drawerId === drawer.id);
  if (!object) return;
  const texData = labelTexture(drawer, markedDrawers.has(drawer.id));
  object.userData.labelTexture.texture.dispose();
  object.userData.labelTexture = texData;
  object.userData.labelMaterial.map = texData.texture;
  object.userData.labelMaterial.needsUpdate = true;
}

function applyFilters() {
  let visible = 0;
  for (const object of drawerObjects) {
    const drawer = drawerById.get(object.userData.drawerId);
    const matches = drawerMatches(drawer);
    object.visible = matches;
    object.userData.face.material = matches
      ? (drawer.id === activeDrawerId ? materials.walnutEdge : materials.walnut)
      : materials.walnutDark;
    if (matches) visible++;
    updateLabelIfMarked(drawer);
  }
  const total = drawers.length;
  searchFeedback.textContent = markedOnly
    ? visible + " marked drawer" + (visible === 1 ? "" : "s") + " in index"
    : query
      ? visible + " matching drawer" + (visible === 1 ? "" : "s") + " of " + total
      : gazettes.length + " papers indexed · " + total + " drawers";
  if (activeDrawerId) renderDrawerContents();
}

function updateLabelIfMarked(drawer) {
  const object = drawerObjects.find((item) => item.userData.drawerId === drawer.id);
  if (!object) return;
  const shouldBeMarked = markedDrawers.has(drawer.id);
  if (object.userData.wasMarked !== shouldBeMarked) {
    object.userData.wasMarked = shouldBeMarked;
    updateLabel(drawer);
  }
}

function setActiveDrawer(drawerId) {
  const drawer = drawerById.get(drawerId);
  if (!drawer) return;
  activeDrawerId = drawerId;
  for (const object of drawerObjects) {
    const selected = object.userData.drawerId === drawerId;
    object.userData.targetZ = selected ? object.userData.openZ : 0;
    object.userData.face.material = selected ? materials.walnutEdge : materials.walnut;
  }
  for (const volume of gazetteVolumes.values()) {
    volume.book.visible = volume.entry.drawer === drawerId && volume !== activeVolume;
  }
  drawerPanel.hidden = false;
  hint.style.opacity = "0";
  intro.style.opacity = ".3";
  drawerTitle.textContent = drawer.label;
  drawerCode.textContent = "INDEX " + drawer.code + " · CLASSIFIED RECORDS";
  drawerDescription.textContent = drawer.description;
  drawerPosition.textContent = "INDEX " + drawer.code + " / " + String(drawers.length).padStart(2, "0");
  markDrawerButton.setAttribute("aria-pressed", String(markedDrawers.has(drawerId)));
  markDrawerButton.innerHTML = markedDrawers.has(drawerId) ? "<span>✦</span> Marked drawer" : "<span>✦</span> Mark drawer";
  renderDrawerContents();
}

function renderDrawerContents() {
  const drawer = drawerById.get(activeDrawerId);
  if (!drawer) return;
  const entries = (gazettesByDrawer.get(drawer.id) || []).filter(issueMatches);
  drawerCount.textContent = entries.length + " FILED PAPER" + (entries.length === 1 ? "" : "S");
  drawerContents.replaceChildren();
  if (!entries.length) {
    const empty = document.createElement("div");
    empty.className = "empty-drawer";
    empty.textContent = query || markedOnly
      ? "No papers in this drawer match the current index. Clear the search or return to all records."
      : "This drawer is prepared for future papers. Add a gazette document and one entry in gazettes.json to file it here.";
    drawerContents.append(empty);
    return;
  }

  for (const entry of entries) {
    const row = document.createElement("div");
    row.className = "paper-entry-row";
    const open = document.createElement("button");
    open.className = "paper-entry";
    open.type = "button";
    open.setAttribute("aria-label", "Open " + entry.title);
    const stamp = document.createElement("span");
    stamp.className = "paper-stamp";
    stamp.textContent = String(entry.issue || "").match(/\d{3}/)?.[0] || "✧";
    const meta = document.createElement("span");
    meta.className = "paper-meta";
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const detail = document.createElement("small");
    detail.textContent = (entry.issue || "GAZETTE") + " · " + (entry.date || "UNDATED");
    meta.append(title, detail);
    const excerpt = document.createElement("span");
    excerpt.className = "paper-excerpt";
    excerpt.textContent = entry.excerpt || "No description has been entered for this paper.";
    open.append(stamp, meta, excerpt);
    open.addEventListener("click", () => openGazette(entry));
    const mark = document.createElement("button");
    mark.className = "paper-mark";
    mark.type = "button";
    mark.textContent = "✦";
    mark.title = markedGazettes.has(entry.slug) ? "Remove mark" : "Mark paper";
    mark.setAttribute("aria-label", mark.title + ": " + entry.title);
    mark.setAttribute("aria-pressed", String(markedGazettes.has(entry.slug)));
    mark.addEventListener("click", () => {
      toggleGazetteMark(entry.slug);
      if (activeGazette?.slug === entry.slug) updateReaderMark();
    });
    row.append(open, mark);
    drawerContents.append(row);
  }
}

function toggleDrawerMark() {
  if (!activeDrawerId) return;
  if (markedDrawers.has(activeDrawerId)) markedDrawers.delete(activeDrawerId);
  else markedDrawers.add(activeDrawerId);
  persistMarks();
  markDrawerButton.setAttribute("aria-pressed", String(markedDrawers.has(activeDrawerId)));
  markDrawerButton.innerHTML = markedDrawers.has(activeDrawerId) ? "<span>✦</span> Marked drawer" : "<span>✦</span> Mark drawer";
  updateLabel(drawerById.get(activeDrawerId));
  applyFilters();
}

function toggleGazetteMark(slug) {
  if (markedGazettes.has(slug)) markedGazettes.delete(slug);
  else markedGazettes.add(slug);
  persistMarks();
  renderDrawerContents();
  applyFilters();
  updateReaderMark();
}

function updateReaderMark() {
  if (!activeGazette) return;
  const marked = markedGazettes.has(activeGazette.slug);
  markIssueButton.setAttribute("aria-pressed", String(marked));
  markIssueButton.innerHTML = marked ? "<span>✦</span> Marked paper" : "<span>✦</span> Mark paper";
}

function safeGazetteUrl(entry) {
  if (typeof entry.file !== "string" || !entry.file.endsWith(".html")) {
    throw new Error("This gazette does not have a valid HTML file path.");
  }
  const url = new URL(entry.file, import.meta.url);
  const basePath = new URL("./gazette/", import.meta.url).pathname;
  if (url.origin !== window.location.origin || !url.pathname.startsWith(basePath)) {
    throw new Error("Gazette files must be stored inside the archive's gazette folder.");
  }
  return url.href;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function pageDocument(entry, pageNumber, heading, blocks, variant = "") {
  const content = blocks.map((block) => {
    const tag = block.type === "quote" ? "blockquote" : block.type === "heading" ? "h2" : "p";
    return "<" + tag + ">" + escapeHTML(block.text) + "</" + tag + ">";
  }).join("");
  return "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><style>" +
    "*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#eee5d2;color:#30271f}" +
    "body{padding:29px 27px 22px;font-family:Georgia,serif}.page{height:100%;position:relative;overflow:hidden;padding-bottom:27px}" +
    ".mast{display:flex;justify-content:space-between;gap:8px;padding-bottom:8px;border-bottom:3px double #4b3a2b;color:#766044;font:7px monospace;letter-spacing:.11em}" +
    "h1{margin:30px 0 13px;font:32px/1.02 Georgia,serif;font-weight:400}h2{margin:22px 0 8px;font:20px/1.1 Georgia,serif;font-weight:500}" +
    "p{margin:0 0 13px;font:16px/1.38 Georgia,serif;text-align:justify}blockquote{margin:22px 0;padding:12px 4px;border-top:1px solid #a78d62;border-bottom:1px solid #a78d62;color:#713b2d;font:italic 21px/1.2 Georgia,serif}" +
    ".deck{margin:0 0 22px;color:#65543e;font:italic 18px/1.3 Georgia,serif}.rule{height:3px;margin:11px 0;background:#913d32}" +
    ".page-foot{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding-top:7px;border-top:1px solid #a78d62;color:#806c50;font:7px monospace;letter-spacing:.12em}" +
    ".cover{text-align:center;padding-top:60px}.cover .paper-name{font:37px Georgia,serif;letter-spacing:.08em}.cover .sub{margin:9px 0 38px;color:#816b4d;font:8px monospace;letter-spacing:.16em}" +
    ".cover .issue{margin-bottom:20px;color:#922f28;font:8px monospace;letter-spacing:.15em}.cover h1{margin:0 auto 18px;max-width:95%;font:39px/1.02 Georgia,serif}.cover .deck{font-size:18px}" +
    ".cover .bottom-seal{margin:45px auto 0;width:68px;height:68px;border:1px solid #a88958;border-radius:50%;display:grid;place-items:center;color:#8f392e;font:30px Georgia,serif}" +
    ".colophon{text-align:center;padding-top:95px}.colophon h1{font-size:30px}.colophon p{text-align:center;font-style:italic}" +
    "</style></head><body><article class='page " + variant + "'><header class='mast'><span>THE HEARTWELL GAZETTE</span><span>" +
    escapeHTML(entry.issue) + "</span></header>" + heading + "<div class='rule'></div>" + content +
    "<footer class='page-foot'><span>HEARTWELL · MUNICIPAL PRESS</span><span>" + String(pageNumber).padStart(2,"0") + " / 08</span></footer></article></body></html>";
}

function blankPageDocument() {
  return "<!doctype html><html><head><meta charset='utf-8'><style>html,body{margin:0;width:100%;height:100%;background:#eee5d2}</style></head><body></body></html>";
}

async function prepareGazettePages(entry) {
  const response = await fetch(safeGazetteUrl(entry));
  if (!response.ok) throw new Error("Could not retrieve " + entry.title);
  const parsed = new DOMParser().parseFromString(await response.text(), "text/html");
  const title = parsed.querySelector("h1")?.textContent?.trim() || entry.title;
  const deck = parsed.querySelector(".standfirst,.deck")?.textContent?.trim() || entry.excerpt || "";
  const issue = parsed.querySelector(".issue")?.textContent?.trim() || entry.issue;
  const nodes = [...parsed.querySelectorAll(".columns h2,.columns p,.columns blockquote,.cols h2,.cols p,.cols blockquote")];
  const blocks = nodes.map((node) => ({
    type: node.tagName.toLowerCase() === "h2" ? "heading" : node.tagName.toLowerCase() === "blockquote" ? "quote" : "paragraph",
    text: node.textContent.trim()
  })).filter((item) => item.text);
  const filler = [
    {type:"paragraph",text:"The notice has been entered into the public register and a copy retained for the municipal file. No further explanation has been issued."},
    {type:"paragraph",text:"Readers familiar with the district will recognise the particulars set out above. The Gazette has received several accounts, though not all could be independently confirmed."},
    {type:"quote",text:"The record remains open. The circumstances do not."},
    {type:"paragraph",text:"This column is retained in the archive as part of the surviving edition. Further amendments, should they be received, will be filed with the original copy."}
  ];
  while (blocks.length < 18) blocks.push(...filler);
  const pages = [];
  const cover = "<section class='cover'><div class='paper-name'>THE GAZETTE</div><div class='sub'>A RECORD OF THE CITY AND ITS DISQUIET</div><div class='issue'>" +
    escapeHTML(issue) + "</div><h1>" + escapeHTML(title) + "</h1><p class='deck'>" + escapeHTML(deck) + "</p><div class='bottom-seal'>H</div></section>";
  pages.push(pageDocument(entry, 1, cover, [], "cover-page"));
  const perPage = Math.ceil(blocks.length / 6);
  for (let page = 0; page < 6; page++) {
    const content = blocks.slice(page * perPage, (page + 1) * perPage);
    pages.push(pageDocument(entry, page + 2, "<h1>" + escapeHTML(title) + "</h1>", content));
  }
  const ending = "<section class='colophon'><div class='paper-name'>THE END</div><h1>" + escapeHTML(title) +
    "</h1><p>Preserved in the Heartwell Municipal Archive.</p><p>Filed under " + escapeHTML(entry.drawer.toUpperCase()) +
    ".</p><div class='bottom-seal'>V</div></section>";
  pages.push(pageDocument(entry, 8, ending, [], "colophon-page"));
  return pages;
}

function updateSpreadIndicator(volume) {
  const label = volume.spread === 0 ? "COVER · 1 / 8"
    : volume.spread === 4 ? "FINAL PAGE · 8 / 8"
    : "PAGES " + (volume.spread * 2) + "–" + (volume.spread * 2 + 1) + " / 8";
  $("#spread-indicator").textContent = label;
  $("#prev-page").disabled = volume.spread === 0 || volume.turning;
  $("#next-page").disabled = volume.spread === 4 || volume.turning;
}

function showSpread(volume, spread) {
  volume.spread = THREE.MathUtils.clamp(spread, 0, 4);
  const leftPage = volume.spread === 0 ? null : (volume.spread === 4 ? 8 : volume.spread * 2);
  const rightPage = volume.spread === 0 ? 1 : (volume.spread === 4 ? null : volume.spread * 2 + 1);
  volume.left.iframe.srcdoc = leftPage ? volume.pages[leftPage - 1] : blankPageDocument();
  volume.right.iframe.srcdoc = rightPage ? volume.pages[rightPage - 1] : blankPageDocument();
  volume.left.object.visible = Boolean(leftPage);
  volume.right.object.visible = Boolean(rightPage);
  volume.left.element.style.visibility = leftPage ? "visible" : "hidden";
  volume.right.element.style.visibility = rightPage ? "visible" : "hidden";
  updateSpreadIndicator(volume);
}

function preparePageFlip(volume, direction) {
  const nextSpread = volume.spread + direction;
  if (nextSpread < 0 || nextSpread > 4) return false;
  const backwards = direction < 0;
  const currentPage = backwards ? (volume.spread === 4 ? 8 : volume.spread * 2) : (volume.spread === 0 ? 1 : volume.spread * 2 + 1);
  const nextPage = backwards ? (nextSpread === 0 ? 1 : nextSpread * 2 + 1) : (nextSpread === 4 ? 8 : nextSpread * 2);
  volume.flipFront.srcdoc = volume.pages[currentPage - 1] || blankPageDocument();
  volume.flipBack.srcdoc = volume.pages[nextPage - 1] || blankPageDocument();
  volume.flipObject.position.x = direction > 0 ? 1.17 : -1.17;
  volume.flipPivot.visible = true;
  volume.flipPivot.rotation.set(0, 0, 0);
  volume.turning = true;
  if (direction > 0) volume.right.object.visible = false;
  else volume.left.object.visible = false;
  updateSpreadIndicator(volume);
  return true;
}
function beginPageDrag(volume, direction, event) {
  if (activeVolume !== volume || reader.hidden || gazetteMotion || volume.turning || pageDrag || !volume.pages) return;
  event.preventDefault();
  event.stopPropagation();
  if (!preparePageFlip(volume, direction)) return;
  pageDrag = { volume, direction, pointerId:event.pointerId, startX:event.clientX, progress:0, phase:"dragging", targetSpread:volume.spread+direction };
  volume.pageTurn = pageDrag;
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch {}
}
function updatePageDrag(event) {
  if (!pageDrag || pageDrag.pointerId !== event.pointerId || pageDrag.phase !== "dragging") return;
  const volume = pageDrag.volume;
  const spine = volume.book.localToWorld(new THREE.Vector3(0, 0, .22)).project(camera);
  const outer = volume.book.localToWorld(new THREE.Vector3(pageDrag.direction > 0 ? 2.34 : -2.34, 0, .22)).project(camera);
  const leafPixels = Math.abs(outer.x - spine.x) * window.innerWidth * .5;
  const distance = pageDrag.direction > 0 ? pageDrag.startX-event.clientX : event.clientX-pageDrag.startX;
  pageDrag.progress = THREE.MathUtils.clamp(distance / Math.max(140, leafPixels), 0, 1);
  volume.pageTurn = pageDrag;
}
function finishPageDrag(event) {
  if (!pageDrag || pageDrag.pointerId !== event.pointerId) return;
  const drag=pageDrag; pageDrag=null;
  drag.phase="settling"; drag.from=drag.progress; drag.to=drag.progress>=.32?1:0;
  drag.start=performance.now(); drag.duration=reducedMotion?0:420;
  drag.volume.pageTurn=drag;
}
function turnPage(direction) {
  const volume=activeVolume;
  if (!volume || volume.turning || gazetteMotion || !volume.pages) return;
  if (!preparePageFlip(volume,direction)) return;
  volume.pageTurn={direction,phase:"settling",progress:0,from:0,to:1,start:performance.now(),duration:reducedMotion?0:720,targetSpread:volume.spread+direction};
}

function beginGazetteOpening(volume, source, sourceQuaternion, sourceScale) {
  activeVolume = volume;
  activeGazette = volume.entry;
  readerLabel.textContent = volume.entry.issue + " · " + volume.entry.title;
  updateReaderMark();
  drawerPanel.hidden = true;
  intro.classList.add("is-obscured");
  $(".catalogue-tools").classList.add("is-obscured");
  $(".scene-caption").classList.add("is-obscured");
  hint.style.opacity = "0";
  const destination = new THREE.Vector3(.45, 2.18, 3.55);
  const displayQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.06, -.10, 0));
  volume.book.position.copy(source);
  volume.book.quaternion.copy(displayQuaternion);
  volume.book.scale.copy(sourceScale);
  volume.coverPivot.rotation.y = 0;
  volume.left.object.visible = false;
  volume.right.object.visible = false;
  volume.flipPivot.visible = false;
  volume.left.element.style.visibility = "hidden";
  volume.right.element.style.visibility = "hidden";
  gazetteMotion = {
    mode:"open", volume, start:performance.now(), duration:reducedMotion?0:1250,
    from:source, to:destination, fromQuaternion:displayQuaternion,
    toQuaternion:displayQuaternion, scaleFrom:sourceScale.x, scaleTo:1
  };
  reader.hidden = false;
  volume.turning = false;
  const pageJob = volume.pages ? Promise.resolve(volume.pages) : prepareGazettePages(volume.entry);
  pageJob.then((pages) => {
    volume.pages = pages;
    if (activeVolume === volume && !reader.hidden) showSpread(volume, 0);
  }).catch((error) => console.error("Could not paginate gazette", error));
}

function openGazette(entry) {
  const volume = gazetteVolumes.get(entry.slug);
  if (!volume) return;
  if (activeDrawerId !== entry.drawer) setActiveDrawer(entry.drawer);
  volume.book.updateWorldMatrix(true, false);
  const source = volume.book.getWorldPosition(new THREE.Vector3());
  const sourceQuaternion = volume.book.getWorldQuaternion(new THREE.Quaternion());
  const sourceScale = volume.book.getWorldScale(new THREE.Vector3());
  scene.attach(volume.book);
  volume.originPosition = source.clone();
  volume.originQuaternion = sourceQuaternion.clone();
  volume.originScale = sourceScale.clone();
  beginGazetteOpening(volume, source, sourceQuaternion, sourceScale);
}

function closeGazette() {
  if (activeVolume?.book.visible && activeVolume.originPosition) {
    reader.hidden = true;
    gazetteMotion = {
      mode:"return", volume:activeVolume, start:performance.now(), duration:reducedMotion?0:950,
      from:activeVolume.book.position.clone(), to:activeVolume.originPosition.clone(),
      fromQuaternion:activeVolume.book.quaternion.clone(), toQuaternion:activeVolume.originQuaternion.clone(),
      scaleFrom:activeVolume.book.scale.x, scaleTo:activeVolume.originScale.x,
      coverFrom:activeVolume.coverPivot.rotation.y, coverTo:0
    };
    return;
  }
  finishGazetteReturn();
}

function finishGazetteReturn() {
  gazetteMotion = null;
  if (activeVolume) {
    activeVolume.left.object.visible = false;
    activeVolume.right.object.visible = false;
    activeVolume.flipPivot.visible = false;
    activeVolume.left.element.style.visibility = "hidden";
    activeVolume.right.element.style.visibility = "hidden";
    activeVolume.left.iframe.srcdoc = blankPageDocument();
    activeVolume.right.iframe.srcdoc = blankPageDocument();
    activeVolume.drawerGroup.attach(activeVolume.book);
    activeVolume.book.position.copy(activeVolume.localPosition);
    activeVolume.book.quaternion.copy(activeVolume.localQuaternion);
    activeVolume.book.scale.copy(activeVolume.localScale);
  }
  reader.hidden = true;
  activeGazette = null;
  activeVolume = null;
  drawerPanel.hidden = !activeDrawerId;
  intro.classList.remove("is-obscured");
  $(".catalogue-tools").classList.remove("is-obscured");
  $(".scene-caption").classList.remove("is-obscured");
  hint.style.opacity = activeDrawerId ? "0" : "1";
}

function closeDrawer() {
  if (!activeDrawerId) return;
  for (const object of drawerObjects) object.userData.targetZ = 0;
  for (const volume of gazetteVolumes.values()) volume.book.visible = false;
  activeDrawerId = null;
  drawerPanel.hidden = true;
  intro.style.opacity = "1";
  hint.style.opacity = "1";
}

function updateSearch() {
  query = searchInput.value.trim().toLocaleLowerCase();
  applyFilters();
}

function initControls() {
  document.addEventListener("pointermove", updatePageDrag);
  document.addEventListener("pointerup", finishPageDrag);
  document.addEventListener("pointercancel", finishPageDrag);
  document.addEventListener("pointermove", updatePageDrag, { passive: false });
  document.addEventListener("pointerup", finishPageDrag);
  document.addEventListener("pointercancel", finishPageDrag);
  $("#clear-search").addEventListener("click", () => {
    searchInput.value = "";
    updateSearch();
    searchInput.focus();
  });
  searchInput.addEventListener("input", updateSearch);
  $("#filter-all").addEventListener("click", () => {
    markedOnly = false;
    $("#filter-all").classList.add("active");
    $("#filter-marked").classList.remove("active");
    applyFilters();
  });
  $("#filter-marked").addEventListener("click", () => {
    markedOnly = !markedOnly;
    $("#filter-marked").classList.toggle("active", markedOnly);
    $("#filter-all").classList.toggle("active", !markedOnly);
    applyFilters();
  });
  $("#close-drawer").addEventListener("click", closeDrawer);
  markDrawerButton.addEventListener("click", toggleDrawerMark);
  $("#close-reader").addEventListener("click", closeGazette);
  $("#prev-page").addEventListener("click", () => turnPage(-1));
  $("#next-page").addEventListener("click", () => turnPage(1));
  markIssueButton.addEventListener("click", () => {
    if (activeGazette) toggleGazetteMark(activeGazette.slug);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!reader.hidden) closeGazette();
      else if (!drawerPanel.hidden) closeDrawer();
    }
  });
}


function initThree() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  cssScene = new THREE.Scene();
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.inset = "0";
  cssRenderer.domElement.style.pointerEvents = "none";
  css3dContainer.appendChild(cssRenderer.domElement);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x17120e, .026);
  camera = new THREE.PerspectiveCamera(39, window.innerWidth / window.innerHeight, .1, 100);
  camera.position.set(0.65, 4.1, 13.4);
  camera.lookAt(.85, 2.0, -1.5);

  const ambient = new THREE.AmbientLight(0xd8c4a3, 1.45);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffdca7, 2.6);
  key.position.set(-4, 8, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -7;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7d6952, 1.5);
  rim.position.set(6, 5, -5);
  scene.add(rim);

  addRoom();
  addCabinet();

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .045;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.minDistance = 7.5;
  controls.maxDistance = 25;
  controls.minPolarAngle = .08;
  controls.maxPolarAngle = Math.PI - .08;
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.target.set(.85, 2.0, -1.5);
  controls.update();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  const pickGazetteVolume = (event) => {
    pointer.x=(event.clientX/window.innerWidth)*2-1;
    pointer.y=-(event.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(drawerObjects,true);
    for (const hit of hits) {
      let node=hit.object;
      while (node && !node.userData.gazetteSlug) node=node.parent;
      if (node?.userData.gazetteSlug) return gazetteVolumes.get(node.userData.gazetteSlug);
    }
    return null;
  };
  canvas.addEventListener("pointerdown",(event)=>{
    if (!reader.hidden || volumeDrag || pageDrag) return;
    const volume=pickGazetteVolume(event);
    if (!volume || !volume.book.visible) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const book=volume.book; book.updateWorldMatrix(true,false);
    const source=book.getWorldPosition(new THREE.Vector3());
    const sourceQuaternion=book.getWorldQuaternion(new THREE.Quaternion());
    const sourceScale=book.getWorldScale(new THREE.Vector3());
    scene.attach(book);
    volume.originPosition=source.clone(); volume.originQuaternion=sourceQuaternion.clone(); volume.originScale=sourceScale.clone();
    activeVolume=volume;
    volumeDrag={volume,source,sourceQuaternion,sourceScale,
      plane:new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),source.clone()),
      startX:event.clientX,startY:event.clientY,pointerId:event.pointerId,moved:false};
    controls.enabled=false;
    try { canvas.setPointerCapture(event.pointerId); } catch {}
    drawerPanel.hidden=true;
  },true);
  canvas.addEventListener("pointermove",(event)=>{
    if (!volumeDrag || volumeDrag.pointerId!==event.pointerId) return;
    event.preventDefault();
    if (Math.hypot(event.clientX-volumeDrag.startX,event.clientY-volumeDrag.startY)<4) return;
    volumeDrag.moved=true;
    pointer.x=(event.clientX/window.innerWidth)*2-1; pointer.y=-(event.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(pointer,camera);
    const point=raycaster.ray.intersectPlane(volumeDrag.plane,new THREE.Vector3());
    if (!point) return;
    point.addScaledVector(camera.getWorldDirection(new THREE.Vector3()),-.24);
    volumeDrag.volume.book.position.copy(point);
    const tilt=THREE.MathUtils.clamp((event.clientX-volumeDrag.startX)/280,-.38,.38);
    volumeDrag.volume.book.quaternion.copy(volumeDrag.sourceQuaternion).multiply(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt*.22,tilt,-tilt*.18))
    );
  },true);
  const releaseGazetteVolume=(event)=>{
    if (!volumeDrag || volumeDrag.pointerId!==event.pointerId) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const drag=volumeDrag; volumeDrag=null; controls.enabled=true;
    if (drag.moved) {
      beginGazetteOpening(drag.volume,drag.volume.book.position.clone(),drag.volume.book.quaternion.clone(),drag.sourceScale);
    } else {
      drag.volume.drawerGroup.attach(drag.volume.book);
      drag.volume.book.position.copy(drag.volume.localPosition);
      drag.volume.book.quaternion.copy(drag.volume.localQuaternion);
      drag.volume.book.scale.copy(drag.volume.localScale);
      activeVolume=null; drawerPanel.hidden=false;
    }
  };
  canvas.addEventListener("pointerup",releaseGazetteVolume,true);
  canvas.addEventListener("pointercancel",releaseGazetteVolume,true);
  canvas.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    if (!reader.hidden || gazetteMotion) { pointerStart = null; return; }
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (moved > 7) return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(drawerObjects, true);
    let selectedVolume = null;
    let selectedDrawer = null;
    for (const item of hits) {
      let node = item.object;
      while (node) {
        if (!selectedVolume && node.userData.gazetteSlug) selectedVolume = node.userData.gazetteSlug;
        if (!selectedDrawer && node.userData.drawerId) selectedDrawer = node.userData.drawerId;
        node = node.parent;
      }
      if (selectedVolume || selectedDrawer) break;
    }
    if (selectedDrawer) setActiveDrawer(selectedDrawer);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (pointerStart) return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(drawerObjects, true);
    const hit = hits.find((item) => {
      let node = item.object;
      while (node && !node.userData.drawerId) node = node.parent;
      return Boolean(node?.userData.drawerId && node.visible);
    });
    const next = hit ? hit.object : null;
    if (next !== hoveredObject) {
      hoveredObject = next;
      canvas.style.cursor = next ? "pointer" : "grab";
    }
  });
  window.addEventListener("resize", resize);
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer?.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .05);
  for (const object of drawerObjects) {
    const target = object.userData.targetZ;
    const speed = reducedMotion ? 1 : 1 - Math.pow(.0008, delta);
    object.position.z = THREE.MathUtils.lerp(object.position.z, target, speed);
  }
  if (gazetteMotion) {
    const volume = gazetteMotion.volume;
    const book = volume.book;
    const t = gazetteMotion.duration === 0 ? 1 : Math.min(1, (performance.now() - gazetteMotion.start) / gazetteMotion.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    book.position.lerpVectors(gazetteMotion.from, gazetteMotion.to, eased);
    book.quaternion.slerpQuaternions(gazetteMotion.fromQuaternion, gazetteMotion.toQuaternion, eased);
    book.scale.setScalar(THREE.MathUtils.lerp(gazetteMotion.scaleFrom, gazetteMotion.scaleTo, eased));
    if (gazetteMotion.mode === "return") {
      volume.coverPivot.rotation.y = THREE.MathUtils.lerp(gazetteMotion.coverFrom, gazetteMotion.coverTo, eased);
    } else {
      const coverProgress = THREE.MathUtils.clamp((t - .4) / .6, 0, 1);
      const coverEase = coverProgress * coverProgress * (3 - 2 * coverProgress);
      volume.coverPivot.rotation.y = Math.PI * .91 * coverEase;
    }
    if (t >= 1) {
      if (gazetteMotion.mode === "return") finishGazetteReturn();
      else gazetteMotion = null;
    }
  }
  if (activeVolume?.book.visible) {
    const volume = activeVolume;
    const book = volume.book;
    book.updateMatrixWorld(true);
    const worldQuaternion = book.getWorldQuaternion(new THREE.Quaternion());
    for (const [page, x] of [[volume.left, -1], [volume.right, 1]]) {
      const position = book.localToWorld(new THREE.Vector3(x * 1.17, 0, .205));
      page.object.position.copy(position);
      page.object.quaternion.copy(worldQuaternion);
      page.object.scale.setScalar(.0045 * book.scale.x);
    }
    const spine = book.localToWorld(new THREE.Vector3(0, 0, .215));
    volume.flipPivot.position.copy(spine);
    volume.flipPivot.quaternion.copy(worldQuaternion);
    volume.flipPivot.scale.setScalar(book.scale.x);
    if (volume.pageTurn) {
      const turn = volume.pageTurn;
      let progress = turn.progress || 0;
      if (turn.phase === "settling") {
        const elapsed = performance.now() - turn.start;
        const t = turn.duration === 0 ? 1 : Math.min(1, elapsed / turn.duration);
        progress = THREE.MathUtils.lerp(turn.from, turn.to, t * t * (3 - 2 * t));
      }
      volume.flipPivot.quaternion.copy(worldQuaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (turn.direction > 0 ? -1 : 1) * Math.PI * progress));
      if (turn.phase === "settling" && (turn.duration === 0 || performance.now() - turn.start >= turn.duration)) {
        volume.flipPivot.visible = false;
        volume.turning = false;
        volume.pageTurn = null;
        showSpread(volume, turn.to >= .5 ? turn.targetSpread : volume.spread);
      }
    }
  }
  controls?.update();
  renderer.render(scene, camera);
  cssRenderer?.render(cssScene, camera);
}

function validateManifest(data) {
  if (!data || !Array.isArray(data.drawers) || !Array.isArray(data.gazettes)) {
    throw new Error("gazettes.json must contain drawers and gazettes arrays.");
  }
  const ids = new Set();
  for (const drawer of data.drawers) {
    if (!drawer.id || ids.has(drawer.id)) throw new Error("Every drawer needs a unique id.");
    ids.add(drawer.id);
  }
  for (const entry of data.gazettes) {
    if (!entry.slug || !entry.drawer || !ids.has(entry.drawer) || !entry.file) {
      throw new Error("Each gazette needs a slug, valid drawer id and HTML file path.");
    }
  }
}

async function start() {
  try {
    const response = await fetch("./gazettes.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("The archive index could not be loaded (" + response.status + ").");
    manifest = await response.json();
    validateManifest(manifest);
    drawers = manifest.drawers;
    gazettes = manifest.gazettes;
    drawerById = new Map(drawers.map((drawer) => [drawer.id, drawer]));
    gazettesByDrawer = new Map(drawers.map((drawer) => [drawer.id, []]));
    for (const entry of gazettes) gazettesByDrawer.get(entry.drawer).push(entry);
    initControls();
    initThree();
    applyFilters();
    animate();
    loading.classList.add("done");
  } catch (error) {
    console.error("The Heartwell archive could not be prepared:", error);
    loading.classList.add("done");
    fallback.hidden = false;
    const paragraph = fallback.querySelector(".fallback-card p:last-child");
    if (paragraph) paragraph.textContent = error.message + " Check that gazettes.json is present and valid.";
  }
}
start();
