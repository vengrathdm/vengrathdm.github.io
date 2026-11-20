import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const $ = (selector) => document.querySelector(selector);
const viewport = $("#viewport");
const board = $("#board");
const filters = $("#filters");
const search = $("#search");
const emptyState = $("#empty-state");
const preview = $("#preview");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let records = [];
let activeTag = "Wszystko";
let resizeFrame = 0;
let previewTween;
let renderer;
let scene;
let camera;
let particles;
let particlePositions;
let clock;

// A tiny deterministic PRNG keeps each page in the same visual neighbourhood
// after filtering, resizing, and returning to the page.
function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function startAtmosphere() {
  const canvas = $("#atmosphere");
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.z = 32;
    clock = new THREE.Clock();

    const count = 430;
    particlePositions = new Float32Array(count * 3);
    const random = seededRandom(271828);
    for (let i = 0; i < count; i++) {
      particlePositions[i * 3] = (random() - .5) * 58;
      particlePositions[i * 3 + 1] = (random() - .5) * 34;
      particlePositions[i * 3 + 2] = (random() - .5) * 20;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xc9a96d, size: 1.15, transparent: true, opacity: .52,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particles.rotation.y = Math.sin(t * .045) * .035;
      particles.rotation.x = Math.cos(t * .035) * .018;
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += .0018 + (i % 5) * .00025;
        if (positions[i * 3 + 1] > 18) positions[i * 3 + 1] = -18;
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();
    window.addEventListener("resize", () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (error) {
    console.warn("WebGL atmosphere unavailable; continuing without it.", error);
    canvas.hidden = true;
  }
}

function describe(record) {
  const category = record.category || "Collection";
  if (record.type === "tool") return "An interactive Vengrath tool and part of the wider collection.";
  if (category === "Aktywna Kampania") return "An active campaign in the Vengrath collection.";
  if (category === "Zamknięta Kampania") return "A completed campaign preserved in the Vengrath archive.";
  if (category === "Archiwum") return "A chronicle preserved in the Vengrath archive.";
  return "Explore this part of the Vengrath collection.";
}

function visibleRecords() {
  const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase("pl")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const query = normalize(search.value);
  return records.filter((record) => {
    if (record.visibility === "hidden") return query === "hidden" || query === normalize(record.title);
    return (activeTag === "Wszystko" || record.category === activeTag) &&
      (!query || normalize(record.title).includes(query) || normalize(record.category).includes(query));
  });
}

function renderFilters() {
  filters.replaceChildren();
  const categories = [...new Set(records.filter(r => r.visibility !== "hidden").map(r => r.category).filter(Boolean))];
  ["Wszystko", ...categories].forEach((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter" + (index === 0 ? " active" : "");
    button.textContent = label;
    button.dataset.tag = label;
    filters.append(button);
  });
}

function polygonPath(points) {
  return points ? "M" + points.map(p => p.join(",")).join("L") + "Z" : "";
}

function makeSvgElement(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  return element;
}

function addLabels(group, record, polygon) {
  const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
  const width = maxX - minX, height = maxY - minY;
  const fontSize = Math.max(13, Math.min(27, height * .22, width * .12));
  const title = makeSvgElement("text", {
    x: centerX, y: centerY - 2, class: "cell-title",
    "font-size": fontSize
  });
  title.textContent = record.title;
  group.append(title);
  const tag = makeSvgElement("text", {
    x: centerX, y: centerY + fontSize * .92 + 9, class: "cell-tag"
  });
  tag.textContent = (record.category || "").toLocaleUpperCase("pl");
  group.append(tag);
}

function showPreview(record) {
  $("#preview-image").src = record.image || "";
  $("#preview-image").alt = record.title;
  $("#preview-category").textContent = record.category || "Vengrath collection";
  $("#preview-title").textContent = record.title;
  $("#preview-description").textContent = describe(record);
  preview.dataset.href = record.url;
  preview.setAttribute("aria-hidden", "false");
  if (previewTween) previewTween.kill();
  previewTween = gsap.to(preview, { autoAlpha: 1, y: 0, duration: .24, ease: "power2.out", overwrite: true });
}

function hidePreview() {
  if (previewTween) previewTween.kill();
  previewTween = gsap.to(preview, { autoAlpha: 0, y: 10, duration: .18, ease: "power2.in", overwrite: true,
    onComplete: () => preview.setAttribute("aria-hidden", "true") });
}

function build() {
  const items = visibleRecords();
  $("#count").textContent = String(items.length).padStart(2, "0") + " ENTRIES";
  board.replaceChildren();
  emptyState.hidden = items.length > 0;
  if (!items.length) return;

  const width = Math.max(680, viewport.clientWidth - 64);
  const cellBase = window.innerWidth < 680 ? 165 : 225;
  const columns = Math.max(2, Math.ceil(width / cellBase));
  const rows = Math.ceil(items.length / columns);
  const cellW = width / columns;
  const cellH = Math.max(window.innerWidth < 680 ? 160 : 195, Math.min(260, (viewport.clientHeight - 100) / Math.max(2, Math.min(rows, 4))));
  const height = Math.max(viewport.clientHeight - 40, rows * cellH + 30);
  const random = seededRandom(93517 + items.length * 31);
  const sites = items.map((record, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return [
      (col + .5) * cellW + (random() - .5) * cellW * .32,
      (row + .5) * cellH + (random() - .5) * cellH * .30,
      record
    ];
  });
  const delaunay = d3.Delaunay.from(sites, d => d[0], d => d[1]);
  const voronoi = delaunay.voronoi([0, 0, width, height]);
  const svg = makeSvgElement("svg", { width, height, viewBox: `0 0 ${width} ${height}`, role: "group", "aria-label": "Campaign collection" });
  const defs = makeSvgElement("defs");
  svg.append(defs);

  items.forEach((record, index) => {
    const polygon = voronoi.cellPolygon(index);
    if (!polygon || polygon.length < 3) return;
    const id = "home2-cell-" + index;
    const d = polygonPath(polygon);
    const clip = makeSvgElement("clipPath", { id });
    clip.append(makeSvgElement("path", { d }));
    defs.append(clip);

    const anchor = makeSvgElement("a", {
      href: record.url, class: "cell", tabindex: "0",
      "aria-label": record.title + " — " + (record.category || "Vengrath")
    });
    anchor.dataset.index = String(index);
    const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]);
    const x = Math.min(...xs), y = Math.min(...ys);
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    const image = makeSvgElement("image", {
      x, y, width: w, height: h, href: record.image || "",
      preserveAspectRatio: "xMidYMid slice", "clip-path": `url(#${id})`, class: "cell-image"
    });
    anchor.append(image);
    anchor.append(makeSvgElement("path", { d, class: "cell-shade" }));
    const labelGroup = makeSvgElement("g", { "clip-path": `url(#${id})` });
    addLabels(labelGroup, record, polygon);
    anchor.append(labelGroup);
    anchor.addEventListener("pointerenter", () => showPreview(record));
    anchor.addEventListener("pointerleave", hidePreview);
    anchor.addEventListener("focus", () => showPreview(record));
    anchor.addEventListener("blur", hidePreview);
    svg.append(anchor);
  });

  board.append(svg);
  if (!reducedMotion) {
    gsap.from(svg.querySelectorAll(".cell"), {
      autoAlpha: 0, scale: .94, transformOrigin: "50% 50%",
      duration: .72, stagger: { each: .018, from: "random" }, ease: "power3.out", clearProps: "all"
    });
  }
}

function entrance() {
  const intro = $("#intro");
  const app = $("#app");
  if (reducedMotion) {
    intro.remove();
    gsap.set(app, { opacity: 1 });
    return;
  }
  const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  timeline.from(".intro-rule", { scale: .82, autoAlpha: 0, duration: .9 })
    .from(".intro img", { scale: .65, autoAlpha: 0, duration: .65 }, "-=.55")
    .from(".intro-kicker,.intro h1,.intro-subtitle", { y: 18, autoAlpha: 0, duration: .65, stagger: .12 }, "-=.35")
    .to(".intro-progress span", { scaleX: 1, duration: .55, ease: "power2.inOut" }, "-=.2")
    .to(intro, { autoAlpha: 0, duration: .8, ease: "power2.inOut", onComplete: () => intro.remove() }, "+=.12")
    .to(app, { opacity: 1, duration: .65 }, "<+.12")
    .from(".topbar", { y: -12, autoAlpha: 0, duration: .55 }, "<")
    .from(".board-heading", { y: 10, autoAlpha: 0, duration: .45 }, "<+.1");
}

filters.addEventListener("click", event => {
  const button = event.target.closest("button[data-tag]");
  if (!button) return;
  activeTag = button.dataset.tag;
  filters.querySelectorAll("button").forEach(el => el.classList.toggle("active", el === button));
  hidePreview();
  build();
});
search.addEventListener("input", () => { hidePreview(); build(); });
$("#clear-filters").addEventListener("click", () => {
  search.value = "";
  activeTag = "Wszystko";
  filters.querySelectorAll("button").forEach(el => el.classList.toggle("active", el.dataset.tag === "Wszystko"));
  build();
});
viewport.addEventListener("pointerdown", event => {
  if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest(".cell")) return;
  viewport.dataset.dragX = String(event.clientX);
  viewport.dataset.dragY = String(event.clientY);
  viewport.dataset.scrollLeft = String(viewport.scrollLeft);
  viewport.dataset.scrollTop = String(viewport.scrollTop);
  viewport.classList.add("dragging");
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener("pointermove", event => {
  if (!viewport.classList.contains("dragging")) return;
  viewport.scrollLeft = Number(viewport.dataset.scrollLeft) - (event.clientX - Number(viewport.dataset.dragX));
  viewport.scrollTop = Number(viewport.dataset.scrollTop) - (event.clientY - Number(viewport.dataset.dragY));
});
const endDrag = () => viewport.classList.remove("dragging");
viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);
viewport.addEventListener("click", event => {
  if (event.target.closest(".cell")) return;
  if (preview.dataset.href) hidePreview();
});
window.addEventListener("resize", () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(build);
});

async function init() {
  startAtmosphere();
  const response = await fetch("/core/data/site-pages.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("Could not load Vengrath page registry.");
  records = (await response.json()).filter(record =>
    typeof record.url === "string" && record.url.startsWith("/page/") &&
    typeof record.title === "string" && typeof record.image === "string"
  );
  renderFilters();
  build();
  entrance();
}

init().catch(error => {
  console.error(error);
  board.textContent = "Nie udało się wczytać kolekcji Vengrath.";
  board.style.color = "#ffb4b4";
  gsap.set($("#app"), { opacity: 1 });
  $("#intro")?.remove();
});