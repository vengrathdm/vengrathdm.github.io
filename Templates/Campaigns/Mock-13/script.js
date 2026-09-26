
/* ============================================================
   TAB NAVIGATION
   ============================================================ */
function goToPage(name){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  const btn = document.querySelector('.tab-btn[data-page="' + name + '"]');
  if(target){ target.classList.add('active'); }
  if(btn){ btn.classList.add('active'); }
  window.scrollTo({top:0, behavior:'instant'});
}
document.getElementById('tabList').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if(!btn) return;
  goToPage(btn.dataset.page);
});

/* ============================================================
   SESSION LOG ACCORDION
   ============================================================ */
document.getElementById('sessionLog').addEventListener('click', (e) => {
  const head = e.target.closest('.session-head');
  if(!head) return;
  const entry = head.closest('.session-entry');
  const wasOpen = entry.classList.contains('open');
  document.querySelectorAll('.session-entry.open').forEach(el => el.classList.remove('open'));
  if(!wasOpen){ entry.classList.add('open'); }
});

/* ============================================================
   RELATIONSHIP MAP (SVG, drawn from data)
   ============================================================ */
const relData = {
  nodes: [
    {id:'rin',   label:'RIN',   x:150, y:80},
    {id:'boro',  label:'BORO',  x:380, y:60},
    {id:'sable', label:'SABLE', x:610, y:90},
    {id:'otto',  label:'OTTO',  x:250, y:250},
    {id:'vess',  label:'VESS',  x:520, y:260},
    {id:'cindral', label:'CINDRAL', x:80, y:190, big:true},
    {id:'union', label:'UNION', x:250, y:340, big:true},
    {id:'undertow', label:'UNDERTOW', x:610, y:190, big:true},
  ],
  links: [
    ['rin','cindral','Reports to (secretly)'],
    ['boro','cindral','Ex-navy loyalty'],
    ['boro','union','Owes a debt'],
    ['otto','union','Sent to keep faith'],
    ['sable','undertow','Patron has interest'],
    ['vess','undertow','Works as courier'],
    ['rin','otto','Trusts'],
    ['sable','vess','Splits information'],
  ]
};

function buildRelMap(){
  const svg = document.getElementById('relSvg');
  const lineG = document.getElementById('relLines');
  const nodeG = document.getElementById('relNodes');
  const caption = document.getElementById('relCaption');
  const nodeById = Object.fromEntries(relData.nodes.map(n => [n.id, n]));

  relData.links.forEach(([a,b,label]) => {
    const na = nodeById[a], nb = nodeById[b];
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
    line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
    line.setAttribute('class','relline');
    line.dataset.a = a; line.dataset.b = b; line.dataset.label = label;
    lineG.appendChild(line);
  });

  relData.nodes.forEach(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');    g.setAttribute('class','relnode');
    g.dataset.id = n.id;
    g.setAttribute('transform', `translate(${n.x},${n.y})`);
    const r = n.big ? 40 : 30;
    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('r', r);
    g.appendChild(circle);
    const text = document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute('dy','0.32em');
    text.textContent = n.label;
    if(n.big){ text.style.fontSize = '10px'; }
    g.appendChild(text);
    g.addEventListener('click', () => highlightNode(n.id));
    nodeG.appendChild(g);
  });

  function highlightNode(id){
    document.querySelectorAll('.relnode').forEach(el => el.classList.remove('highlight'));
    document.querySelectorAll('.relline').forEach(el => el.classList.remove('highlight'));
    const connections = [];
    document.querySelectorAll('.relline').forEach(line => {
      if(line.dataset.a === id || line.dataset.b === id){
        line.classList.add('highlight');
        const otherId = line.dataset.a === id ? line.dataset.b : line.dataset.a;
        const otherLabel = nodeById[otherId].label;
        connections.push(`${otherLabel} (${line.dataset.label})`);
      }
    });
    document.querySelector(`.relnode[data-id="${id}"]`).classList.add('highlight');
    const selfLabel = nodeById[id].label;
    caption.innerHTML = connections.length
      ? `<b>${selfLabel}</b> — ${connections.join(' · ')}`
      : `<b>${selfLabel}</b> has no recorded ties yet.`;
  }
}
buildRelMap();
