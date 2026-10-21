/* ---------- DANE (edytuj tutaj) ---------- */
const HOUSES = [
  {id:"vel",name:"Vel'Sharen",rank:1,motto:"Pierwsza w ciszy, pierwsza w krwi.",domain:"Matrona Zhyra, kapłanki Lolth",power:"Magia kapłańska, armia pająków",secret:"Matrona od lat nie słyszy głosu Lolth i ukrywa to przed wszystkimi.",ally:["nym"],feud:["zin"]},
  {id:"nym",name:"Nym'Kael",rank:2,motto:"Ostrze zna swojego pana.",domain:"Akademia wojowników",power:"Elitarni szermierze",secret:"Sprzedaje stal Domowi Zin'Orath, wrogowi swojego sojusznika.",ally:["vel"],feud:["ruv"]},
  {id:"ruv",name:"Ru'Vhaen",rank:3,motto:"Wszystko ma cenę. Ty też.",domain:"Handel i szpiedzy",power:"Sieć informatorów",secret:"Zna prawdziwe imię jednego z bohaterów.",ally:["kor"],feud:["nym"]},
  {id:"zin",name:"Zin'Orath",rank:4,motto:"Jad czeka cierpliwie.",domain:"Alchemicy i truciciele",power:"Trucizny, mutacje",secret:"Hoduje w piwnicach istotę, której nikt nie zaprosił do Podmroku.",ally:["kor"],feud:["vel"]},
  {id:"kor",name:"Kor'Velith",rank:5,motto:"Gdy upadną wielcy, wstaną mali.",domain:"Dom podupadły, żądny awansu",power:"Desperacja i dług u każdego",secret:"Szuka drużyny, by zrzucić winę za planowany zamach.",ally:["ruv","zin"],feud:[]}
];
const PARTY = [
  {name:"Imię postaci",role:"Klasa · rasa · poziom",note:"Jedno zdanie o tym, czego szuka w Podmroku.",status:"żywa"},
  {name:"Imię postaci",role:"Klasa · rasa · poziom",note:"Jedno zdanie o tym, czego szuka w Podmroku.",status:"żywa"},
  {name:"Imię postaci",role:"Klasa · rasa · poziom",note:"Jedno zdanie o tym, czego szuka w Podmroku.",status:"zaginiona"},
  {name:"Imię postaci",role:"Klasa · rasa · poziom",note:"Jedno zdanie o tym, czego szuka w Podmroku.",status:"żywa"}
];
const SESSIONS = [
  {n:1,date:"data sesji",title:"Zejście",text:"Drużyna opuszcza ostatnią latarnię i wchodzi w tunele prowadzące do miasta drowów. Tu wpisz własne podsumowanie."},
  {n:2,date:"data sesji",title:"Zaproszenie na kolację",text:"Dom Kor'Velith składa pierwszą ofertę. Tu wpisz własne podsumowanie."},
  {n:3,date:"data sesji",title:"Tytuł do uzupełnienia",text:"Podsumowanie do uzupełnienia po sesji."}
];

/* ---------- PAJĘCZYNA ---------- */
const NS="http://www.w3.org/2000/svg", C=300, SPOKES=10, RINGS=[70,125,180,235,285];
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.append(e);return e};
const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/SPOKES;return [C+r*Math.cos(a),C+r*Math.sin(a)]};
const svg=document.getElementById("web-svg");
const strands=el("g",{},svg), links=el("g",{},svg), nodes=el("g",{},svg);

for(let i=0;i<SPOKES;i++){const [x,y]=pt(i,RINGS[4]);el("line",{x1:C,y1:C,x2:x,y2:y,class:"strand"},strands)}
RINGS.forEach(r=>{let d="";for(let i=0;i<SPOKES;i++){
  const [x1,y1]=pt(i,r),[x2,y2]=pt(i+1,r),mx=(x1+x2)/2,my=(y1+y2)/2;
  const cx=mx+(C-mx)*.14,cy=my+(C-my)*.14;
  d+=(i?"":`M${x1} ${y1}`)+` Q${cx} ${cy} ${x2} ${y2}`}
  el("path",{d,class:"strand"},strands)});

const pos={}, nodeEl={}, linkEl={};
const angleOrder=[0,3,6,2,8]; // rozmieszczenie domów na szprychach
HOUSES.forEach((h,i)=>{pos[h.id]=pt(angleOrder[i],RINGS[h.rank-1]-(i?0:0))});
HOUSES.forEach(h=>[...h.ally.map(o=>["ally",o]),...h.feud.map(o=>["feud",o])].forEach(([k,o])=>{
  const key=[h.id,o].sort().join("-")+k; if(linkEl[key])return;
  const [x1,y1]=pos[h.id],[x2,y2]=pos[o];
  linkEl[key]=el("path",{d:`M${x1} ${y1} Q${C} ${C} ${x2} ${y2}`,class:"link "+k,"data-a":h.id,"data-b":o},links)}));
HOUSES.forEach(h=>{
  const g=el("g",{class:"node",tabindex:0,role:"button","aria-label":"Dom "+h.name,transform:`translate(${pos[h.id]})`},nodes);
  el("circle",{r:30-h.rank*2},g);
  const t=el("text",{y:5},g); t.textContent=h.name.split("'")[0]+"'";
  g.addEventListener("click",()=>pick(h.id));
  g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(h.id)}});
  nodeEl[h.id]=g});

const card=document.getElementById("houseCard");
function pick(id){
  const h=HOUSES.find(x=>x.id===id);
  Object.entries(nodeEl).forEach(([k,n])=>n.classList.toggle("sel",k===id));
  Object.entries(nodeEl).forEach(([k,n])=>{n.classList.toggle("rel",h.ally.includes(k));n.classList.toggle("foe",h.feud.includes(k))});
  Object.values(linkEl).forEach(l=>l.classList.toggle("show",l.dataset.a===id||l.dataset.b===id));
  const names=ids=>ids.length?ids.map(i=>HOUSES.find(x=>x.id===i).name).join(", "):"brak";
  card.innerHTML=`<h3>${h.name}</h3><p class="motto">„${h.motto}”</p>
   <dl><dt>Pozycja</dt><dd>${h.rank} z ${HOUSES.length}</dd><dt>Domena</dt><dd>${h.domain}</dd>
   <dt>Siła</dt><dd>${h.power}</dd><dt>Sojusznicy</dt><dd>${names(h.ally)}</dd><dt>Wrogowie</dt><dd>${names(h.feud)}</dd></dl>
   <button class="secret" type="button">Odkryj sekret</button><p class="secret-text" hidden>${h.secret}</p>`;
  const b=card.querySelector(".secret"),s=card.querySelector(".secret-text");
  b.onclick=()=>{s.hidden=!s.hidden;b.textContent=s.hidden?"Odkryj sekret":"Ukryj sekret"};
}
card.innerHTML='<p class="motto">Wybierz dom na pajęczynie.</p>';

/* ---------- DRUŻYNA I KRONIKA ---------- */
document.getElementById("roster").innerHTML=PARTY.map(p=>
  `<li><div class="sigil" aria-hidden="true">${p.name[0]}</div><div><h3>${p.name}</h3><p>${p.role}. ${p.note}</p></div>
   <span class="status ${p.status==="martwa"?"dead":""}">${p.status}</span></li>`).join("");
document.getElementById("sessions").innerHTML=SESSIONS.map(s=>
  `<details><summary><small>Sesja ${s.n}</small>${s.title}</summary><p>${s.text}</p><p><small>${s.date}</small></p></details>`).join("");

/* ---------- MIERNIK GŁĘBOKOŚCI ---------- */
const links2=[...document.querySelectorAll(".gauge li a")], depth=document.getElementById("depth");
const secs=links2.map(a=>document.querySelector(a.hash));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)
  links2.forEach((a,i)=>a.classList.toggle("on",secs[i]===e.target))}),{rootMargin:"-45% 0px -50% 0px"});
secs.forEach(s=>io.observe(s));
let raf;addEventListener("scroll",()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
  const f=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
  depth.textContent=Math.round(f*3200).toLocaleString("pl-PL")})},{passive:true});
