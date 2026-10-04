(() => {
    "use strict";
    const maintenance = location.hash.toLowerCase() === "#maintenance";
    if (maintenance) {
        document.body.classList.add("maintenance-mode");
        document.body.innerHTML = '<main class="maintenance"><div class="maintenance__head"><div><div class="maintenance__eyebrow">VENGRATH / MAINTENANCE</div><h1>Pages</h1></div><a href="/" class="maintenance__home">← VENGRATH</a></div><div id="maintenance-table" class="maintenance__table-wrap"><div class="load-error">Ładowanie…</div></div></main>';
        fetch("res/voronoi_data.json", {
            cache: "no-store"
        }).then(r => {
            if (!r.ok) throw Error("voronoi_data.json");
            return r.json()
        }).then(rows => {
            const wrap = document.getElementById("maintenance-table");
            const table = document.createElement("table");
            table.innerHTML = '<thead><tr><th>Page</th><th>Link</th><th>Content</th><th>Hero</th><th>Style</th><th>Characters</th><th>Chronicle</th><th>Music</th></tr></thead><tbody></tbody>';
            const body = table.querySelector("tbody");
            const ready = {
                "Książęta Heartwell": {
                    Content: "Ready",
                    Hero: "Ready",
                    Style: "Ready",
                    Characters: "Ready",
                    Chronicle: "Ready",
                    Music: "Ready"
                },
                "Legends of Barovia": {
                    Style: "Ready",
                    Characters: "Ready",
                    Chronicle: "Ready",
                    Music: "Ready"
                },
                "Sands of Doom": {
                    Music: "Ready"
                },
                "Blood Red Snow White": {
                    Music: "Ready"
                },
                "Drakkenheim": {
                    Music: "Ready"
                },
                "Dungeons of Drakkenheim": {
                    Music: "Ready"
                },
                "Heroes of Drakkenheim": {
                    Music: "Ready"
                }
            };
            rows.forEach(d => {
                const tr = document.createElement("tr"),
                    name = document.createElement("td"),
                    link = document.createElement("td"),
                    a = document.createElement("a");
                name.textContent = d.CardName;
                a.href = d.CardAdress;
                a.textContent = d.CardAdress;
                a.target = "_blank";
                a.rel = "noopener";
                link.appendChild(a);
                tr.append(name, link);
                ["Content", "Hero", "Style", "Characters", "Chronicle", "Music"].forEach(k => {
                    const td = document.createElement("td");
                    td.textContent = ready[d.CardName]?.[k] || "No";
                    tr.appendChild(td)
                });
                body.appendChild(tr)
            });
            wrap.replaceChildren(table);
        }).catch(() => {
            document.getElementById("maintenance-table").innerHTML = '<div class="load-error">Nie udało się wczytać listy stron.</div>'
        });
        return;
    }
    const viewport = document.getElementById("viewport"),
        board = document.getElementById("board"),
        filters = document.getElementById("filters"),
        search = document.getElementById("search");
    const FILTERS = [
        ["Wszystko", "Wszystko"],
        ["Aktywna Kampania", "Aktywna Kampania"],
        ["Zamknięta Kampania", "Zamknięta Kampania"],
        ["Archiwum", "Archiwum"],
        ["Blog", "Blog"],
        ["Grafika", "Grafika"],
        ["Narzędzie", "Narzędzie"],
        ["Postać", "Postać"]
    ];
    let records = [],
        shuffled = [],
        activeTag = "Wszystko",
        momentum = 0,
        drag = {
            active: false
        };
    const shuffle = a => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]]
        }
        return a
    };
    const path = p => p.map((q, i) => (i ? "L" : "M") + q.x.toFixed(2) + " " + q.y.toFixed(2)).join(" ") + " Z";

    function clip(poly, nx, ny, mid) {
        const o = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i],
                b = poly[(i + 1) % poly.length],
                da = nx * a.x + ny * a.y - mid,
                db = nx * b.x + ny * b.y - mid,
                ia = da <= 0,
                ib = db <= 0;
            if (ia) o.push(a);
            if (ia !== ib) {
                const t = da / (da - db);
                o.push({
                    x: a.x + (b.x - a.x) * t,
                    y: a.y + (b.y - a.y) * t
                })
            }
        }
        return o
    }

    function domain(x0, x1, H, W) {
        const p = [],
            wrap = x => ((x % W) + W) % W,
            top = x => 12 + Math.sin(wrap(x) / 92 + .2) * 9 + Math.sin(wrap(x) / 31) * 3,
            bot = x => H - 12 + Math.sin(wrap(x) / 92 + .7) * 11 + Math.sin(wrap(x) / 37) * 3;
        p.push({
            x: x0,
            y: top(x0)
        });
        for (let x = x0 + 46; x < x1; x += 46) p.push({
            x: x,
            y: top(x)
        });
        p.push({
            x: x1,
            y: top(x1)
        }, {
            x: x1,
            y: bot(x1)
        });
        for (let x = x1 - 46; x > x0; x -= 46) p.push({
            x: x,
            y: bot(x)
        });
        p.push({
            x: x0,
            y: bot(x0)
        });
        return p
    }

    function cell(site, sites, b) {
        let p = b.map(q => ({
            ...q
        }));
        for (const o of sites) {
            if (o === site) continue;
            const nx = o.x - site.x,
                ny = o.y - site.y,
                mid = nx * (o.x + site.x) / 2 + ny * (o.y + site.y) / 2;
            p = clip(p, nx, ny, mid);
            if (!p.length) break
        }
        return p
    }

    function centroid(p) {
        let x = 0,
            y = 0;
        for (const q of p) {
            x += q.x;
            y += q.y
        }
        return {
            x: x / p.length,
            y: y / p.length
        }
    }

    function addText(g, d, p) {
        const c = centroid(p),
            w = Math.max(...p.map(q => q.x)) - Math.min(...p.map(q => q.x)),
            canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");
        let size = Math.min(30, (Math.max(...p.map(q => q.y)) - Math.min(...p.map(q => q.y))) * .28);
        ctx.font = '600 ' + size + 'px "Fira Sans Extra Condensed",sans-serif';
        const lines = [];
        let line = "";
        for (const word of d.CardName.split(/\s+/)) {
            const t = line ? line + " " + word : word;
            if (ctx.measureText(t).width <= w * .78) line = t;
            else {
                if (line) lines.push(line);
                line = word
            }
        }
        if (line) lines.push(line);
        const lh = size * 1.02,
            t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.classList.add("shard-title");
        t.setAttribute("x", c.x);
        t.setAttribute("y", c.y - (lines.length - 1) * lh / 2);
        t.style.fontSize = size + "px";
        lines.forEach((s, i) => {
            const z = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            z.setAttribute("x", c.x);
            z.setAttribute("dy", i ? lh : 0);
            z.textContent = s;
            t.appendChild(z)
        });
        g.appendChild(t);
        const tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tag.classList.add("shard-tag");
        tag.setAttribute("x", c.x);
        tag.setAttribute("y", c.y + (lines.length - 1) * lh / 2 + size + 14);
        tag.textContent = d.CardTags;
        g.appendChild(tag)
    }

    function current() {
        const q = search.value.trim().toLocaleLowerCase("pl");
        return shuffled.filter(d => activeTag === "Wszystko" || d.CardTags === activeTag).filter(d => !q || d.CardName.toLocaleLowerCase("pl").includes(q) || d.CardTags.toLocaleLowerCase("pl").includes(q))
    }

    function build() {
        const H = Math.max(420, viewport.clientHeight || innerHeight - 186),
            W = Math.max(viewport.clientWidth || innerWidth, 320),
            cur = current(),
            tileW = Math.max(210, Math.min(322, W / 4.65)),
            cols = Math.max(1, Math.ceil(cur.length / 5), Math.ceil(W / tileW)),
            worldW = Math.max(W, cols * tileW);
        let sites = [],
            k = 0;
        const counts = Array(cols).fill(Math.floor(cur.length / cols));
        for (let i = 0; i < cur.length % cols; i++) counts[i]++;
        for (let c = 0; c < cols; c++) {
            const rh = H / Math.max(1, counts[c]);
            for (let r = 0; r < counts[c]; r++) sites.push({
                data: cur[k++],
                x: (c + .5) * tileW + (Math.random() - .5) * tileW * .42,
                y: (r + .5) * rh + (Math.random() - .5) * rh * .34
            })
        }
        board.style.width = worldW * 3 + "px";
        board.style.height = H + "px";
        board.innerHTML = "";
        if (!cur.length) return;
        const base = domain(-worldW, 2 * worldW, H, worldW),
            periodic = [];
        for (const s of sites) {
            periodic.push({
                data: s.data,
                x: s.x - worldW,
                y: s.y
            }, {
                data: s.data,
                x: s.x,
                y: s.y
            }, {
                data: s.data,
                x: s.x + worldW,
                y: s.y
            })
        }
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", worldW * 3);
        svg.setAttribute("height", H);
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);
        for (let copy = 0; copy < 3; copy++)
            for (let i = 0; i < sites.length; i++) {
                const s = sites[i],
                    raw = cell(s, periodic, base);
                if (raw.length < 3) continue;
                const poly = raw.map(q => ({
                        x: q.x + copy * worldW,
                        y: q.y
                    })),
                    cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
                    id = "v" + copy + "-" + i;
                cp.id = id;
                const pp = document.createElementNS("http://www.w3.org/2000/svg", "path");
                pp.setAttribute("d", path(poly));
                cp.appendChild(pp);
                defs.appendChild(cp);
                const a = document.createElementNS("http://www.w3.org/2000/svg", "a");
                a.classList.add("shard");
                a.setAttribute("href", s.data.CardAdress);
                a.setAttribute("aria-label", s.data.CardName);
                const xs = poly.map(q => q.x),
                    ys = poly.map(q => q.y),
                    im = document.createElementNS("http://www.w3.org/2000/svg", "image");
                im.setAttribute("x", Math.min(...xs));
                im.setAttribute("y", Math.min(...ys));
                im.setAttribute("width", Math.max(...xs) - Math.min(...xs));
                im.setAttribute("height", Math.max(...ys) - Math.min(...ys));
                im.setAttribute("preserveAspectRatio", "xMidYMid slice");
                im.setAttribute("clip-path", "url(#" + id + ")");
                im.setAttribute("href", s.data.CardGraphic);
                a.appendChild(im);
                const tint = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tint.setAttribute("d", path(poly));
                tint.classList.add("shard-tint");
                a.appendChild(tint);
                const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("clip-path", "url(#" + id + ")");
                addText(g, s.data, poly);
                a.appendChild(g);
                svg.appendChild(a)
            }
        board.appendChild(svg);
        viewport.scrollLeft = worldW
    }

    function wrap() {
        const w = board.offsetWidth / 3;
        if (viewport.scrollLeft < .25 * w) viewport.scrollLeft += w;
        else if (viewport.scrollLeft > 1.75 * w) viewport.scrollLeft -= w
    }
    async function load() {
        const r = await fetch("res/voronoi_data.json", {
            cache: "no-store"
        });
        if (!r.ok) throw Error("voronoi_data.json");
        records = await r.json();
        shuffled = shuffle(records.slice());
        build()
    }

    function setup() {
        FILTERS.forEach(([label, tag], i) => {
            const b = document.createElement("button");
            b.className = "filter" + (i ? "" : " active");
            b.dataset.tag = tag;
            b.textContent = label;
            filters.appendChild(b)
        });
        filters.onclick = e => {
            const b = e.target.closest(".filter");
            if (!b) return;
            activeTag = b.dataset.tag;
            filters.querySelectorAll(".filter").forEach(x => x.classList.toggle("active", x === b));
            build()
        };
        search.oninput = build
    }
    viewport.onscroll = wrap;
    viewport.addEventListener("wheel", e => {
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (d) {
            e.preventDefault();
            viewport.scrollLeft += d * 2.5
        }
    }, {
        passive: false
    });
    viewport.addEventListener("pointerdown", e => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        cancelAnimationFrame(momentum);
        drag = {
            active: true,
            startX: e.clientX,
            lastX: e.clientX,
            lastTime: performance.now(),
            velocity: 0,
            moved: false,
            target: e.target.closest?.(".shard")
        };
        viewport.setPointerCapture(e.pointerId);
        viewport.style.cursor = "grabbing"
    });
    viewport.addEventListener("pointermove", e => {
        if (!drag.active) return;
        const now = performance.now(),
            dx = e.clientX - drag.lastX,
            dt = Math.max(1, now - drag.lastTime);
        viewport.scrollLeft -= dx;
        drag.velocity = -dx / dt * 16;
        drag.moved = Math.abs(e.clientX - drag.startX) > 8;
        drag.lastX = e.clientX;
        drag.lastTime = now
    });
    viewport.addEventListener("pointerup", e => {
        if (!drag.active) return;
        const moved = drag.moved,
            link = drag.target?.getAttribute("href");
        drag.active = false;
        viewport.style.cursor = "grab";
        try {
            viewport.releasePointerCapture(e.pointerId)
        } catch (_) {}
        let v = drag.velocity;
        const tick = () => {
            viewport.scrollLeft += v;
            wrap();
            v *= .94;
            if (Math.abs(v) > .15) momentum = requestAnimationFrame(tick)
        };
        if (Math.abs(v) > .15) momentum = requestAnimationFrame(tick);
        if (!moved && link) location.assign(link)
    });
    addEventListener("resize", build);
    setup();
    load().catch(e => {
        console.error(e);
        board.innerHTML = '<div class="load-error">Nie udało się wczytać danych kart.</div>'
    })
})();
