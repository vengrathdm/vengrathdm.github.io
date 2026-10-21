import { loadCharacterCatalog } from "/v/core/templates/CharacterGallery/CharacterRepository.js";
import { createCharacterCard } from "/v/core/templates/CharacterCard/CharacterCard.js";
/* ---------- DANE (edytuj tutaj) ---------- */
const HOUSES = [
  {id:"vel",name:"Vel'Sharen",rank:1,motto:"Pierwsza w ciszy, pierwsza w krwi.",domain:"Matrona Zhyra, kapłanki Lolth",power:"Magia kapłańska, armia pająków",secret:"Matrona od lat nie słyszy głosu Lolth i ukrywa to przed wszystkimi.",ally:["nym"],feud:["zin"]},
  {id:"nym",name:"Nym'Kael",rank:2,motto:"Ostrze zna swojego pana.",domain:"Akademia wojowników",power:"Elitarni szermierze",secret:"Sprzedaje stal Domowi Zin'Orath, wrogowi swojego sojusznika.",ally:["vel"],feud:["ruv"]},
  {id:"ruv",name:"Ru'Vhaen",rank:3,motto:"Wszystko ma cenę. Ty też.",domain:"Handel i szpiedzy",power:"Sieć informatorów",secret:"Zna prawdziwe imię jednego z bohaterów.",ally:["kor"],feud:["nym"]},
  {id:"zin",name:"Zin'Orath",rank:4,motto:"Jad czeka cierpliwie.",domain:"Alchemicy i truciciele",power:"Trucizny, mutacje",secret:"Hoduje w piwnicach istotę, której nikt nie zaprosił do Podmroku.",ally:["kor"],feud:["vel"]},
  {id:"kor",name:"Kor'Velith",rank:5,motto:"Gdy upadną wielcy, wstaną mali.",domain:"Dom podupadły, żądny awansu",power:"Desperacja i dług u każdego",secret:"Szuka drużyny, by zrzucić winę za planowany zamach.",ally:["ruv","zin"],feud:[]}
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
const roster=document.getElementById("roster");
const rosterIds=["char-0001","char-0002","char-0003","char-0004"];
try{
 const catalog=await loadCharacterCatalog();
 const selected=rosterIds.map(id=>catalog.characters.find(character=>character.id===id)).filter(Boolean);
 roster.replaceChildren(...selected.map(character=>createCharacterCard(character,catalog.achievements)));
 roster.addEventListener("characterselect",event=>{
  const c=event.detail.character,dialog=document.getElementById("characterDialog"),content=document.getElementById("characterDialogContent");
  content.replaceChildren();
  const portrait=document.createElement("div");portrait.className="drow-dialog-portrait";const img=document.createElement("img");img.src=c.portrait;img.alt="Portret "+c.character;portrait.append(img);content.append(portrait);
  const copy=document.createElement("div"),kicker=document.createElement("p"),heading=document.createElement("h2"),dl=document.createElement("dl");
  kicker.className="lead-in";kicker.textContent="ARCHIWUM POSTACI · "+c.id;heading.textContent=c.character;
  [["Gracz",c.player],["Kampanie",(c.campaigns||[]).join(", ")],["Moduły",(c.modules||[]).join(", ")],["Klasy",(c.classes||[]).join(", ")],["Rasa",c.race],["Status",c.status],["Historia",c.history||"Brak zapisków."]].forEach(([label,value])=>{const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value||"Nie podano";dl.append(dt,dd)});
  copy.append(kicker,heading,dl);content.append(copy);dialog.showModal();
 });
}catch(error){console.error(error);roster.textContent="Nie udało się wczytać kart postaci.";}
document.getElementById("sessions").innerHTML=SESSIONS.map(s=>
  `<details><summary><small>Sesja ${s.n}</small>${s.title}</summary><p>${s.text}</p><p><small>${s.date}</small></p></details>`).join("");

/* ---------- NAWIGACJA SEKCJI ---------- */
const navLinks=[...document.querySelectorAll(".gauge li a")];
const depth=document.getElementById("depth");
const panels=navLinks.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
const panelById=new Map(panels.map(panel=>[panel.id,panel]));

function showPanel(id,{writeHash=false,scroll=true}={}){
  const activeId=panelById.has(id)?id:"surface";
  panels.forEach(panel=>{
    const active=panel.id===activeId;
    panel.hidden=!active;
    panel.setAttribute("aria-hidden",String(!active));
  });
  navLinks.forEach(link=>{
    const active=link.hash==="#"+activeId;
    link.classList.toggle("on",active);
    if(active) link.setAttribute("aria-current","page");
    else link.removeAttribute("aria-current");
  });
  depth.textContent=String(Math.max(0,panels.findIndex(panel=>panel.id===activeId)*800));
  if(writeHash && location.hash!=="#"+activeId) history.pushState({section:activeId},"","#"+activeId);
  if(scroll) window.scrollTo({top:0,behavior:"auto"});
}

function navigateToPanel(event){
  const link=event.currentTarget;
  const id=link.hash.slice(1);
  if(!panelById.has(id)) return;
  event.preventDefault();
  showPanel(id,{writeHash:true});
}
navLinks.forEach(link=>link.addEventListener("click",navigateToPanel));
document.querySelectorAll('a[href="#surface"],a[href="#web"],a[href="#party"],a[href="#chronicle"]').forEach(link=>{
  if(navLinks.includes(link)) return;
  link.addEventListener("click",navigateToPanel);
});
window.addEventListener("popstate",()=>showPanel(location.hash.slice(1),{scroll:true}));
panels.forEach(panel=>{panel.hidden=true;panel.setAttribute("aria-hidden","true");});
showPanel(location.hash.slice(1),{scroll:false});
