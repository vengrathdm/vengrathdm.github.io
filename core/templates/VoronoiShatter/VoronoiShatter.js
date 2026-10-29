const shuffle = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const path = (p) =>
  p
    .map((q, i) => (i ? "L" : "M") + q.x.toFixed(2) + " " + q.y.toFixed(2))
    .join(" ") + " Z";
function clip(poly, nx, ny, mid) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i],
      b = poly[(i + 1) % poly.length],
      da = nx * a.x + ny * a.y - mid,
      db = nx * b.x + ny * b.y - mid,
      ia = da <= 0,
      ib = db <= 0;
    if (ia) out.push(a);
    if (ia !== ib) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}
function cell(site, sites, bounds) {
  let p = bounds.map((q) => ({ ...q }));
  for (const other of sites) {
    if (other === site) continue;
    const nx = other.x - site.x,
      ny = other.y - site.y,
      mid = (nx * (other.x + site.x)) / 2 + (ny * (other.y + site.y)) / 2;
    p = clip(p, nx, ny, mid);
    if (!p.length) break;
  }
  return p;
}
function domain(x0, x1, h) {
  const top = () => 0,
    bot = () => h,
    p = [{ x: x0, y: top(x0) }];
  for (let x = x0 + 46; x < x1; x += 46) p.push({ x, y: top(x) });
  p.push({ x: x1, y: top(x1) }, { x: x1, y: bot(x1) });
  for (let x = x1 - 46; x > x0; x -= 46) p.push({ x, y: bot(x) });
  p.push({ x: x0, y: bot(x0) });
  return p;
}
function labels(group, data, poly) {
  const center = poly.reduce(
      (a, p) => ({ x: a.x + p.x / poly.length, y: a.y + p.y / poly.length }),
      { x: 0, y: 0 },
    ),
    w = Math.max(...poly.map((p) => p.x)) - Math.min(...poly.map((p) => p.x)),
    h = Math.max(...poly.map((p) => p.y)) - Math.min(...poly.map((p) => p.y)),
    size = Math.min(30, h * 0.28),
    canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
  ctx.font = "600 " + size + 'px "Fira Sans Extra Condensed",sans-serif';
  const lines = [];
  let line = "";
  for (const word of data.title.split(/\s+/)) {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width <= w * 0.78) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const lh = size * 1.02,
    text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.classList.add("voronoi-shard-title");
  text.setAttribute("x", center.x);
  text.setAttribute("y", center.y - ((lines.length - 1) * lh) / 2);
  text.style.fontSize = size + "px";
  lines.forEach((value, i) => {
    const span = document.createElementNS(text.namespaceURI, "tspan");
    span.setAttribute("x", center.x);
    span.setAttribute("dy", i ? lh : 0);
    span.textContent = value;
    text.append(span);
  });
  group.append(text);
  const tag = document.createElementNS(text.namespaceURI, "text");
  tag.classList.add("voronoi-shard-tag");
  tag.setAttribute("x", center.x);
  tag.setAttribute("y", center.y + ((lines.length - 1) * lh) / 2 + size + 14);
  tag.textContent = data.category || "";
  group.append(tag);
}
export class VoronoiShatter {
  constructor({
    viewport,
    board,
    filters,
    search,
    emptyState,
    clearFilters,
    dataUrl = "/core/data/site-pages.json",
  }) {
    Object.assign(this, {
      viewport,
      board,
      filters,
      search,
      emptyState,
      clearFilters,
      dataUrl,
      activeTag: "Wszystko",
      momentum: 0,
      drag: null,
    });
    this.bind();
  }
  async mount() {
    const r = await fetch(this.dataUrl);
    if (!r.ok) throw new Error("Nie udało się wczytać danych Voronoi.");
    this.records = await r.json();
    this.shuffled = shuffle(
      this.records.filter(
        (record) =>
          typeof record.url === "string" && record.url.startsWith("/page/"),
      ),
    );
    this.renderFilters();
    this.build();
  }
  current() {
    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLocaleLowerCase("pl")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const q = normalize(this.search.value);
    return this.shuffled.filter((d) => {
      const isHidden = d.visibility === "hidden";
      if (isHidden) return q === "hidden" || q === normalize(d.title);
      return (
        (this.activeTag === "Wszystko" || d.category === this.activeTag) &&
        (!q ||
          normalize(d.title).includes(q) ||
          normalize(d.category).includes(q))
      );
    });
  }
  renderFilters() {
    this.filters.replaceChildren();
    const categories = [
      ...new Set(
        this.shuffled
          .filter((record) => record.visibility !== "hidden")
          .map((record) => record.category)
          .filter(Boolean),
      ),
    ];
    ["Wszystko", ...categories].forEach((label, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "voronoi-filter" + (!i ? " is-active" : "");
      b.textContent = label;
      b.dataset.tag = label;
      this.filters.append(b);
    });
  }
  build() {
    const h = Math.max(420, this.viewport.clientHeight || innerHeight - 186),
      w = Math.max(this.viewport.clientWidth || innerWidth, 320),
      records = this.current(),
      tile = Math.max(210, Math.min(322, w / 4.65)),
      viewportColumns = Math.ceil(w / tile),
      contentColumns =
        records.length >= 4
          ? Math.min(viewportColumns, records.length - 1)
          : viewportColumns,
      cols = Math.max(1, Math.ceil(records.length / 5), contentColumns),
      world = Math.max(w, cols * tile);
    let k = 0;
    const counts = Array(cols).fill(Math.floor(records.length / cols));
    for (let i = 0; i < records.length % cols; i++) counts[i]++;
    const sites = [];
    for (let c = 0; c < cols; c++) {
      const rh = h / Math.max(1, counts[c]);
      for (let r = 0; r < counts[c]; r++)
        sites.push({
          data: records[k++],
          x: (c + 0.5) * tile + (Math.random() - 0.5) * tile * 0.42,
          y: (r + 0.5) * rh + (Math.random() - 0.5) * rh * 0.34,
        });
    }
    this.world = world;
    this.board.style.width = world * 3 + "px";
    this.board.style.height = h + "px";
    this.board.replaceChildren();
    this.emptyState.hidden = records.length > 0;
    if (!records.length) return;
    const bounds = domain(-world, 2 * world, h),
      periodic = [];
    sites.forEach((s) =>
      periodic.push(
        { ...s, x: s.x - world },
        { ...s },
        { ...s, x: s.x + world },
      ),
    );
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", world * 3);
    svg.setAttribute("height", h);
    const defs = document.createElementNS(svg.namespaceURI, "defs");
    svg.append(defs);
    for (let copy = 0; copy < 3; copy++)
      for (let i = 0; i < sites.length; i++) {
        const s = sites[i],
          raw = cell(s, periodic, bounds);
        if (raw.length < 3) continue;
        const poly = raw.map((p) => ({ x: p.x + copy * world, y: p.y })),
          id = "cell-" + copy + "-" + i,
          cp = document.createElementNS(svg.namespaceURI, "clipPath"),
          shape = document.createElementNS(svg.namespaceURI, "path");
        cp.id = id;
        shape.setAttribute("d", path(poly));
        cp.append(shape);
        defs.append(cp);
        const a = document.createElementNS(svg.namespaceURI, "a");
        a.classList.add("voronoi-shard");
        a.setAttribute("href", s.data.url);
        a.setAttribute("aria-label", s.data.title);
        if (copy !== 1) {
          a.setAttribute("aria-hidden", "true");
          a.setAttribute("tabindex", "-1");
        }
        const xs = poly.map((p) => p.x),
          ys = poly.map((p) => p.y),
          im = document.createElementNS(svg.namespaceURI, "image");
        im.setAttribute("x", Math.min(...xs));
        im.setAttribute("y", Math.min(...ys));
        im.setAttribute("width", Math.max(...xs) - Math.min(...xs));
        im.setAttribute("height", Math.max(...ys) - Math.min(...ys));
        im.setAttribute("preserveAspectRatio", "xMidYMid slice");
        im.setAttribute("clip-path", "url(#" + id + ")");
        im.setAttribute("href", s.data.image);
        a.append(im);
        const tint = document.createElementNS(svg.namespaceURI, "path");
        tint.setAttribute("d", path(poly));
        tint.classList.add("voronoi-shard-tint");
        a.append(tint);
        const g = document.createElementNS(svg.namespaceURI, "g");
        g.setAttribute("clip-path", "url(#" + id + ")");
        labels(g, s.data, poly);
        a.append(g);
        svg.append(a);
      }
    this.board.append(svg);
    this.viewport.scrollLeft = world;
  }
  wrap() {
    const w = this.board.offsetWidth / 3;
    if (this.viewport.scrollLeft < 0.25 * w) this.viewport.scrollLeft += w;
    else if (this.viewport.scrollLeft > 1.75 * w) this.viewport.scrollLeft -= w;
  }
  bind() {
    this.filters.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-tag]");
      if (!b) return;
      this.activeTag = b.dataset.tag;
      this.filters
        .querySelectorAll("button")
        .forEach((x) => x.classList.toggle("is-active", x === b));
      this.build();
    });
    this.search.addEventListener("input", () => this.build());
    this.clearFilters.addEventListener("click", () => {
      this.search.value = "";
      this.activeTag = "Wszystko";
      this.filters
        .querySelectorAll("button")
        .forEach((x) =>
          x.classList.toggle("is-active", x.dataset.tag === "Wszystko"),
        );
      this.build();
    });
    this.viewport.addEventListener("scroll", () => this.wrap());
    this.viewport.addEventListener(
      "wheel",
      (e) => {
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (d) {
          e.preventDefault();
          this.viewport.scrollLeft += d * 2.5;
        }
      },
      { passive: false },
    );
    this.viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(this.momentum);
      this.drag = {
        startX: e.clientX,
        lastX: e.clientX,
        lastTime: performance.now(),
        velocity: 0,
        moved: false,
        target: e.target.closest?.(".voronoi-shard"),
      };
      this.viewport.setPointerCapture(e.pointerId);
      this.viewport.style.cursor = "grabbing";
    });
    this.viewport.addEventListener("pointermove", (e) => {
      if (!this.drag) return;
      const now = performance.now(),
        dx = e.clientX - this.drag.lastX,
        dt = Math.max(1, now - this.drag.lastTime);
      this.viewport.scrollLeft -= dx;
      this.drag.velocity = (-dx / dt) * 16;
      this.drag.moved = Math.abs(this.drag.startX - e.clientX) > 8;
      this.drag.lastX = e.clientX;
      this.drag.lastTime = now;
    });
    this.viewport.addEventListener("pointerup", (e) => {
      if (!this.drag) return;
      const d = this.drag;
      this.drag = null;
      this.viewport.style.cursor = "grab";
      try {
        this.viewport.releasePointerCapture(e.pointerId);
      } catch {}
      let v = d.velocity;
      const tick = () => {
        this.viewport.scrollLeft += v;
        this.wrap();
        v *= 0.94;
        if (Math.abs(v) > 0.15) this.momentum = requestAnimationFrame(tick);
      };
      if (Math.abs(v) > 0.15) this.momentum = requestAnimationFrame(tick);
      if (!d.moved && d.target?.getAttribute("href"))
        location.assign(d.target.getAttribute("href"));
    });
    window.addEventListener("resize", () => this.build());
  }
}
