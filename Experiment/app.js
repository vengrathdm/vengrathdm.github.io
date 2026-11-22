import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
const reveal = $("#gazette-reveal");
const revealCoverTitle = $("#reveal-cover-title");
const revealTitle = $("#reveal-title");
const readerLabel = $("#reader-label");
const iframe = $("#gazette-frame");
const frameLoading = $("#frame-loading");
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
let renderer, scene, camera, controls, raycaster, pointer, cabinetRoot;
let drawerObjects = [];
let activeDrawerId = null;
let activeGazette = null;
let revealTimer = null;
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

function createDrawer(drawer, index, column, row) {
  const group = new THREE.Group();
  group.userData.drawerId = drawer.id;
  group.userData.index = index;
  const width = 1.16;
  const height = .55;
  const depth = .84;

  // The tray and its false back remain behind the face when the drawer is closed.
  box(group, [width - .035, height - .04, .13], [0, 0, .01], materials.walnutEdge);
  box(group, [width - .12, .045, depth], [0, -height * .45, -depth / 2], materials.walnutDark);
  box(group, [.045, height - .09, depth], [-width * .47, 0, -depth / 2], materials.walnutEdge);
  box(group, [.045, height - .09, depth], [width * .47, 0, -depth / 2], materials.walnutEdge);
  box(group, [width - .12, .04, depth], [0, height * .43, -depth / 2], materials.walnutEdge);

  // Filing cards are visible within the drawer when it is pulled open.
  for (let n = 0; n < 5; n++) {
    const card = box(
      group,
      [.105, .31 + (n % 2) * .035, .34],
      [-.43 + n * .19, -.025, -.28 - (n % 2) * .035],
      n % 3 === 0 ? materials.paperDark : materials.paper,
      { cast: false }
    );
    card.rotation.y = (n - 2) * .035;
    box(group, [.07, .012, .012], [-.43 + n * .19, .105, -.095], materials.brass, { cast: false });
  }

  const face = box(group, [width, height, .14], [0, 0, .12], materials.walnut);
  face.userData.drawerId = drawer.id;
  face.userData.pickable = true;
  const facePlate = box(group, [.93, .36, .025], [0, .01, .198], materials.brass);
  facePlate.userData.drawerId = drawer.id;
  facePlate.userData.pickable = true;
  const label = labelTexture(drawer, markedDrawers.has(drawer.id));
  const labelMat = new THREE.MeshStandardMaterial({ map: label.texture, roughness: .95 });
  const labelMesh = box(group, [.79, .205, .014], [0, .025, .218], labelMat, { cast: false });
  labelMesh.userData.drawerId = drawer.id;
  labelMesh.userData.pickable = true;

  // A small brass cup pull and a dark circular recess.
  const recess = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .025, 32), materials.black);
  recess.rotation.x = Math.PI / 2;
  recess.position.set(0, -.176, .222);
  group.add(recess);
  const pull = new THREE.Mesh(new THREE.TorusGeometry(.066, .012, 8, 28), materials.brassLight);
  pull.position.set(0, -.185, .245);
  group.add(pull);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(.021, 12, 8), materials.brassLight);
  pin.position.set(0, -.185, .253);
  group.add(pin);

  // Screw heads at the label-plate corners.
  for (const sx of [-.43, .43]) {
    for (const sy of [-.145, .145]) {
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
      : total + " drawers indexed";
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
    object.userData.targetZ = object.userData.drawerId === drawerId ? object.userData.openZ : 0;
    object.userData.face.material = object.userData.drawerId === drawerId ? materials.walnutEdge : materials.walnut;
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

function openGazette(entry) {
  let url;
  try { url = safeGazetteUrl(entry); }
  catch (error) {
    console.error(error);
    alert("This record points to a missing or invalid gazette HTML file.");
    return;
  }
  activeGazette = entry;
  readerLabel.textContent = entry.issue + " · " + entry.title;
  revealCoverTitle.textContent = entry.title;
  revealTitle.textContent = entry.title.toUpperCase();
  updateReaderMark();
  frameLoading.classList.remove("hidden");
  hint.style.opacity = "0";
  drawerPanel.hidden = true;
  intro.style.opacity = "0";
  reveal.hidden = false;
  reveal.classList.remove("is-opening");
  void reveal.offsetWidth;
  reveal.classList.add("is-opening");
  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(() => {
    reveal.hidden = true;
    reveal.classList.remove("is-opening");
    reader.hidden = false;
    iframe.src = url;
  }, reducedMotion ? 0 : 1420);
}

function closeGazette() {
  window.clearTimeout(revealTimer);
  reveal.hidden = true;
  reveal.classList.remove("is-opening");
  reader.hidden = true;
  iframe.src = "about:blank";
  activeGazette = null;
  drawerPanel.hidden = !activeDrawerId;
  intro.style.opacity = activeDrawerId ? ".3" : "1";
  hint.style.opacity = activeDrawerId ? "0" : "1";
}

function closeDrawer() {
  if (!activeDrawerId) return;
  for (const object of drawerObjects) object.userData.targetZ = 0;
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
  markIssueButton.addEventListener("click", () => {
    if (activeGazette) toggleGazetteMark(activeGazette.slug);
  });
  iframe.addEventListener("load", () => frameLoading.classList.add("hidden"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!reader.hidden || !reveal.hidden) closeGazette();
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
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 17;
  controls.minPolarAngle = Math.PI * .29;
  controls.maxPolarAngle = Math.PI * .49;
  controls.minAzimuthAngle = -.22;
  controls.maxAzimuthAngle = .22;
  controls.target.set(.85, 2.0, -1.5);
  controls.update();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  canvas.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (moved > 7) return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(drawerObjects, true);
    const hit = hits.find((item) => {
      let node = item.object;
      while (node && !node.userData.drawerId) node = node.parent;
      return Boolean(node?.userData.drawerId);
    });
    if (hit) {
      let node = hit.object;
      while (node && !node.userData.drawerId) node = node.parent;
      if (node?.userData.drawerId) setActiveDrawer(node.userData.drawerId);
    }
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
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), .05);
  for (const object of drawerObjects) {
    const target = object.userData.targetZ;
    const current = object.position.z;
    const speed = reducedMotion ? 1 : 1 - Math.pow(.0008, delta);
    object.position.z = THREE.MathUtils.lerp(current, target, speed);
  }
  controls?.update();
  renderer.render(scene, camera);
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
