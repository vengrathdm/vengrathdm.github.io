/* SALA CHWAŁY 3 — GENERATIVE NECROPOLIS
 * Delaunay triangulation + Voronoi-inspired cells.
 * This layer decorates the existing Hall of Fame registry without owning its data.
 */
(()=>{
  const grid=document.getElementById("hallGrid");
  if(!grid) return;

  const TAU=Math.PI*2;
  const rand=(seed)=>{
    let x=Math.sin(seed*12.9898)*43758.5453;
    return x-Math.floor(x);
  };

  function circumcircle(a,b,c){
    const ax=a.x, ay=a.y, bx=b.x, by=b.y, cx=c.x, cy=c.y;
    const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(d)<1e-8) return null;
    const ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d;
    const uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d;
    const r2=(ux-ax)**2+(uy-ay)**2;
    return {x:ux,y:uy,r2};
  }

  function delaunay(points){
    if(points.length<3) return [];
    const pts=points.map((p,i)=>({...p,i}));
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
    const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
    const d=Math.max(maxX-minX,maxY-minY)||1, midX=(minX+maxX)/2, midY=(minY+maxY)/2;
    const superPts=[
      {x:midX-20*d,y:midY-2*d,i:-1},
      {x:midX,y:midY+20*d,i:-2},
      {x:midX+20*d,y:midY-2*d,i:-3}
    ];
    const all=pts.concat(superPts);
    let tris=[{a:-1,b:-2,c:-3}];

    for(const p of pts){
      const bad=[];
      for(const t of tris){
        const cc=circumcircle(all.find(q=>q.i===t.a),all.find(q=>q.i===t.b),all.find(q=>q.i===t.c));
        if(cc && (p.x-cc.x)**2+(p.y-cc.y)**2<=cc.r2+0.0001) bad.push(t);
      }
      const edges=[];
      for(const t of bad){
        [[t.a,t.b],[t.b,t.c],[t.c,t.a]].forEach(e=>{
          const reverse=edges.findIndex(x=>x[0]===e[1]&&x[1]===e[0]);
          if(reverse>=0) edges.splice(reverse,1); else edges.push(e);
        });
      }
      tris=tris.filter(t=>!bad.includes(t));
      for(const e of edges) tris.push({a:e[0],b:e[1],c:p.i});
    }
    return tris.filter(t=>t.a>=0&&t.b>=0&&t.c>=0);
  }

  function circumcenters(points,tris){
    return tris.map(t=>{
      const cc=circumcircle(points[t.a],points[t.b],points[t.c]);
      return cc?{...cc,tri:t}:null;
    }).filter(Boolean);
  }

  function seedPoints(cards,w,h){
    const n=cards.length;
    const points=[];
    const cols=Math.max(1,Math.ceil(Math.sqrt(n*w/Math.max(h,1))));
    for(let i=0;i<n;i++){
      const row=Math.floor(i/cols), col=i%cols;
      const gx=(col+.5)/(Math.min(cols,Math.ceil(n/Math.max(1,Math.floor(n/cols))))||cols);
      const gy=(row+.5)/Math.ceil(n/cols);
      points.push({
        x:w*(.08+.84*Math.min(1,gx)+(rand(i+11)-.5)*.13),
        y:h*(.08+.84*gy+(rand(i+71)-.5)*.11)
      });
    }
    return points;
  }

  function build(){
    const cards=[...grid.querySelectorAll(".card")];
    if(!cards.length) return;

    grid.classList.add("generative-grid");
    let old=grid.querySelector(".geometry-layer");
    if(old) old.remove();

    const rect=grid.getBoundingClientRect();
    const w=Math.max(rect.width,320);
    const cardW=Math.max(210,Math.min(320,w*.27));
    const rows=Math.ceil(cards.length/Math.max(1,Math.floor(w/cardW)));
    const h=Math.max(560,rows*(cardW*1.34));
    grid.style.minHeight=h+"px";

    const points=seedPoints(cards,w,h);
    const tris=delaunay(points);
    const centers=circumcenters(points,tris);

    const layer=document.createElement("svg");
    layer.className="geometry-layer";
    layer.setAttribute("viewBox","0 0 "+w+" "+h);
    layer.setAttribute("preserveAspectRatio","none");

    const defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
    const glow=document.createElementNS("http://www.w3.org/2000/svg","filter");
    glow.setAttribute("id","ember-glow");
    glow.innerHTML='<feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
    defs.appendChild(glow); layer.appendChild(defs);

    const lines=document.createElementNS("http://www.w3.org/2000/svg","g");
    lines.setAttribute("class","delaunay-lines");

    for(const t of tris){
      const path=document.createElementNS("http://www.w3.org/2000/svg","path");
      const a=points[t.a],b=points[t.b],c=points[t.c];
      path.setAttribute("d",`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} Z`);
      lines.appendChild(path);
    }

    const cells=document.createElementNS("http://www.w3.org/2000/svg","g");
    cells.setAttribute("class","voronoi-cells");
    points.forEach((p,i)=>{
      const near=centers.filter(c=>{
        const t=c.tri;
        return t.a===i||t.b===i||t.c===i;
      }).sort((a,b)=>Math.atan2(a.y-p.y,a.x-p.x)-Math.atan2(b.y-p.y,b.x-p.x));
      if(near.length<3) return;
      const poly=document.createElementNS("http://www.w3.org/2000/svg","polygon");
      poly.setAttribute("points",near.map(c=>c.x+","+c.y).join(" "));
      poly.dataset.index=i;
      cells.appendChild(poly);
    });

    layer.appendChild(lines); layer.appendChild(cells);
    const nodes=document.createElementNS("http://www.w3.org/2000/svg","g");
    nodes.setAttribute("class","geometry-nodes");
    points.forEach((p,i)=>{
      const g=document.createElementNS("http://www.w3.org/2000/svg","g");
      g.dataset.index=i;
      const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
      c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",i%7===0?3.5:2);
      g.appendChild(c);nodes.appendChild(g);
    });
    layer.appendChild(nodes);
    grid.prepend(layer);

    cards.forEach((card,i)=>{
      const p=points[i];
      const cw=Math.min(cardW, w*.29);
      const ch=cw*1.52;
      card.classList.add("geo-card");
      card.style.width=cw+"px";
      card.style.left=(p.x-cw/2)+"px";
      card.style.top=(p.y-ch/2)+"px";
      card.style.setProperty("--gx",p.x);
      card.style.setProperty("--gy",p.y);
      card.dataset.node=i;
      card.addEventListener("mouseenter",()=>activate(i),{once:false});
      card.addEventListener("mouseleave",()=>deactivate(i),{once:false});
    });
  }

  function activate(i){
    grid.classList.add("node-active");
    grid.querySelectorAll(".geometry-layer [data-index='"+i+"']").forEach(x=>x.classList.add("active"));
    grid.querySelectorAll(".geo-card").forEach(c=>c.classList.toggle("related",c.dataset.node===String(i)));
  }
  function deactivate(){
    grid.classList.remove("node-active");
    grid.querySelectorAll(".geometry-layer .active").forEach(x=>x.classList.remove("active"));
    grid.querySelectorAll(".geo-card.related").forEach(x=>x.classList.remove("related"));
  }

  let timer;
  const observer=new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(build,30);
  });
  observer.observe(grid,{childList:true});

  const resize=new ResizeObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(build,120);
  });
  resize.observe(grid);

  setTimeout(build,80);
})();
