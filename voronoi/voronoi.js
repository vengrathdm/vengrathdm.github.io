(() => {
  "use strict";

  const DEFAULTS = Object.freeze({
    inset: 7,
    topMargin: 14,
    bottomMargin: 14,
    sideMargin: 14,
    topPadding: 8,
    bottomPadding: 8,
    sidePadding: 6,
    topNoise: 13,
    bottomNoise: 13,
    sideNoise: 10
  });

  function cell(site, sites, bounds) {
    let polygon = [
      { x: bounds.x0, y: bounds.y0 },
      { x: bounds.x1, y: bounds.y0 },
      { x: bounds.x1, y: bounds.y1 },
      { x: bounds.x0, y: bounds.y1 }
    ];
    for (const other of sites) {
      if (other === site) continue;
      const nx = other.x - site.x, ny = other.y - site.y;
      const midpoint = nx * (other.x + site.x) / 2 + ny * (other.y + site.y) / 2;
      const next = [];
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const da = nx * a.x + ny * a.y - midpoint;
        const db = nx * b.x + ny * b.y - midpoint;
        const insideA = da <= 0, insideB = db <= 0;
        if (insideA) next.push(a);
        if (insideA !== insideB) {
          const t = da / (da - db);
          next.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        }
      }
      polygon = next;
      if (!polygon.length) break;
    }
    return polygon;
  }

  function centroid(polygon) {
    let x = 0, y = 0;
    for (const point of polygon) { x += point.x; y += point.y; }
    return { x: x / polygon.length, y: y / polygon.length };
  }

  function shape(polygon, index, width, height, overrides = {}) {
    const options = { ...DEFAULTS, ...overrides };
    const center = centroid(polygon);
    const seed = (index + 1) * 97;
    return polygon.map((point, corner) => {
      const dx = center.x - point.x, dy = center.y - point.y;
      const distance = Math.hypot(dx, dy) || 1;
      let next = {
        x: point.x + dx / distance * options.inset,
        y: point.y + dy / distance * options.inset
      };
      const n1 = Math.sin(seed + corner * 19.17);
      const n2 = Math.cos(seed * 1.7 + corner * 13.41);
      if (next.y < options.topMargin) next.y += options.topPadding + Math.abs(n1) * options.topNoise;
      if (next.y > height - options.bottomMargin) next.y -= options.bottomPadding + Math.abs(n2) * options.bottomNoise;
      if (next.x < options.sideMargin) next.x += options.sidePadding + Math.abs(n2) * options.sideNoise;
      if (next.x > width - options.sideMargin) next.x -= options.sidePadding + Math.abs(n1) * options.sideNoise;
      return next;
    });
  }

  function generate(sites, bounds, options = {}) {
    const shapeOptions = options.shape || {};
    return sites.map((site, index) => {
      const raw = cell(site, sites, bounds);
      if (raw.length < 3) return null;
      return {
        site,
        raw,
        polygon: options.deform === false ? raw : shape(raw, index, bounds.x1 - bounds.x0, bounds.y1 - bounds.y0, shapeOptions)
      };
    });
  }

  window.VoronoiMain = Object.freeze({ DEFAULTS, cell, centroid, shape, generate });
})();