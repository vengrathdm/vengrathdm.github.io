import { createHomeButton } from "/core/templates/HomeButton/HomeButton.js";
/* Wait for the intended display fonts before revealing the campaign UI. */
const fontRequests = [
  document.fonts.load('400 3rem "Pirata One"'),
  document.fonts.load('400 1rem "Special Elite"'),
  document.fonts.load('400 1rem "Crimson Pro"'),
  document.fonts.load('400 1rem "Voltaire"')
];
try {
  await Promise.race([
    Promise.all(fontRequests).then(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 3500))
  ]);
}
catch (error) {
  console.warn("Font loading fallback:", error);
}
document.body.classList.remove("fonts-loading");
/* Campaign-owned copy and sample records live in content.json. */
const contentResponse = await fetch("./content.json");
if (!contentResponse.ok) {
  throw new Error("Nie udało się wczytać content.json.");
}
const PAGE_DATA = await contentResponse.json();
const REPO = "https://vengrathdm.github.io";
const homeButton = createHomeButton();
homeButton.classList.add("red-hand-home-button");
document.querySelector(".back")?.replaceWith(homeButton);
const CAMPAIGN = "Red Hand of Doom";
const CHARACTER_IDS = PAGE_DATA.characterIds || [];
const ART = PAGE_DATA.art || {
}
;
const SAMPLE_CHARACTERS = PAGE_DATA.characters || [];
const SAMPLE_SESSIONS = PAGE_DATA.sessions || [];
const HORDE = PAGE_DATA.horde || [];
const $=s=>document.querySelector(s),mk=(t,c,x)=>Object.assign(document.createElement(t),{
  className:c||"",textContent:x||""
}
);
if(ART.stageBg)$("#stage").style.cssText+=`background:linear-gradient(#120c0bcc,#120c0bcc),url(${ART.stageBg}) center/cover`;
$("#horde").append(...HORDE.map(([n,d],i)=>{
  const u=mk("div","unit");u.dataset.n=i+1;u.append(mk("h3","",n),mk("p","",d));return u
}
));
function card(c){
  const a=mk("article","cc");
  a.tabIndex=0;
  a.setAttribute("role","button");
  a.setAttribute("aria-label",c.character+" — obróć kartę");
  const pt=mk("div","pt");
  if(c.portrait){
    const i=new Image();
    i.alt=c.character+" — portret postaci";
    i.src=c.portrait.startsWith("http")?c.portrait:REPO+c.portrait;
    i.onerror=()=>pt.replaceChildren(mk("span","","✋"));
    pt.append(i)
  }
  else pt.append(mk("span","","✋"));
  const f=mk("div","f");
  f.append(pt,mk("h3","",c.character),mk("div","m",[c.race,(c.classes||[]).join(" / ")].filter(Boolean).join(" · ")));
  if(c.status)f.append(mk("div","badge",c.status));
  const b=mk("div","b");
  b.append(mk("h3","",c.character));
  const dl=mk("dl");
  [["Gracz",c.player],["Rasa",c.race],["Klasa",(c.classes||[]).join(" / ")],["Status",c.status]].forEach(([k,v])=>dl.append(mk("dt","",k),mk("dd","",v||"—")));
  b.append(dl,mk("p","",c.history||""));
  const i=mk("div","in");
  i.append(f,b);
  a.append(i);
  const t=()=>a.classList.toggle("flip");
  a.onclick=t;
  a.onkeydown=e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      t()
    }
  }
  ;
  return a
}
function entry(s){
  const r=mk("article","ent"),h=mk("div","eh");
  h.tabIndex=0;
  h.setAttribute("role","button");
  const L=s.recordings||[],ls=mk("div","ls");
  L.forEach((x,i)=>{
    const a=mk("a","play",L.length>1?"▶ Część "+(x.partNumber||i+1):"▶ Odtwórz");a.href=x.url;a.target="_blank";a.rel="noopener";a.onclick=e=>e.stopPropagation();ls.append(a)
  }
  );
  h.append(mk("span","en",String(s.sessionNumber).padStart(2,"0")),mk("span","et",s.title||"Bez tytułu"),mk("span","ed",s.date||""),ls);
  r.append(h,mk("div","eb",s.description||s.notes||""));
  const t=()=>r.classList.toggle("open");
  h.onclick=t;
  h.onkeydown=e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      t()
    }
  }
  ;
  return r
}
(async()=>{
  let ch=SAMPLE_CHARACTERS,se=SAMPLE_SESSIONS;
 try{
    const r=await fetch(REPO+"/core/data/characters.json");if(r.ok){
      const all=await r.json();const p=all.filter(c=>CHARACTER_IDS.includes(c.id)||(c.campaigns||[]).includes(CAMPAIGN));if(p.length)ch=p
    }
  }
  catch(e){
  }
  $("#character-gallery").append(...ch.map(card));
 $("#campaign-chronicle").append(...(se.length?se.map(entry):[mk("p","empty","Brak wpisów — pierwszy dzień marszu jeszcze nie nadszedł.")]));
}
)();
/* ===== the march: drag the banner to change section ===== */
const panes=[...document.querySelectorAll(".pane")],nodes=[...document.querySelectorAll(".node")],track=$("#track"),flag=$("#flag"),POS=[10,50,90];
let idx=-1;
const army=$("#army"),wipe=$("#wipe");
function show(i,snap=true){
  if(i===idx&&!snap)return;
  if(idx>=0&&i!==idx)wipeGo();
  idx=i;
  panes.forEach((p,k)=>{
    p.hidden = k !== i;
  p.classList.toggle("on",k===i);p.classList.toggle("before",k<i);p.classList.toggle("after",k>i);p.inert=k!==i
  }
  );
  nodes.forEach((n,k)=>n.classList.toggle("on",k===i));
  track.setAttribute("aria-valuenow",i);
  track.setAttribute("aria-valuetext",nodes[i].lastElementChild.textContent);
  document.documentElement.style.setProperty("--burn",[.1,.5,1][i]);
  if(snap){
    flag.style.left=POS[i]+"%";
    army.style.width=POS[i]+"%"
  }
  panes[i].scrollTop=0
}
function pct(e){
  const r=track.getBoundingClientRect();
  return Math.min(96,Math.max(4,(e.clientX-r.left)/r.width*100))
}
let dragging=false;
track.addEventListener("pointerdown",e=>{
  if(e.target.closest(".node")&&e.pointerType==="mouse"&&false)return;dragging=true;track.classList.add("drag");track.setPointerCapture(e.pointerId);move(e)
}
);
track.addEventListener("pointermove",e=>dragging&&move(e));
function move(e){
  const p=pct(e);
  flag.style.left=p+"%";
  army.style.width=p+"%";
  show(p<30?0:p<70?1:2,false)
}
const end=()=>{
  if(!dragging)return;
  dragging=false;
  track.classList.remove("drag");
  flag.style.left=POS[idx]+"%";
  army.style.width=POS[idx]+"%"
}
;
track.addEventListener("pointerup",end);
track.addEventListener("pointercancel",end);
track.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight")show(Math.min(2,idx+1));if(e.key==="ArrowLeft")show(Math.max(0,idx-1))
}
);
addEventListener("keydown",e=>{
  if(e.target.closest(".cc,.eh"))return;if(e.key==="ArrowRight")show(Math.min(2,idx+1));if(e.key==="ArrowLeft")show(Math.max(0,idx-1))
}
);
show(0);
function wipeGo(){
  const r=flag.getBoundingClientRect();
  wipe.style.setProperty("--wx",(r.left+r.width/2)+"px");
  wipe.classList.remove("go");
  void wipe.offsetWidth;
  wipe.classList.add("go")
}
addEventListener("keydown",e=>{
  if("123".includes(e.key)&&e.key)show(+e.key-1)
}
);
/* swipe on touch */
let sx=0,sy=0;
const st=$("#stage");
st.addEventListener("pointerdown",e=>{
  sx=e.clientX;sy=e.clientY
}
);
st.addEventListener("pointerup",e=>{
  if(e.pointerType==="mouse")return;const dx=e.clientX-sx;if(Math.abs(dx)>80&&Math.abs(e.clientY-sy)<50)show(Math.max(0,Math.min(2,idx+(dx<0?1:-1))))
}
);
/* torch light follows cursor */
st.addEventListener("pointermove",e=>{
  st.style.setProperty("--mx",e.clientX+"px");st.style.setProperty("--my",(e.clientY-st.getBoundingClientRect().top)+"px")
}
);
/* staggered reveal indices + card tilt */
const stagger = () => {
  document.querySelectorAll(".unit,.cc,.ent,.dispatch p,.dispatch .facts").forEach((element) => {
    const siblings = [...element.parentElement.children];
    const index = siblings.filter((sibling) =>
      sibling.tagName === element.tagName || !element.matches("p")
    ).indexOf(element);
    element.style.setProperty("--k", index);
  });
};
setTimeout(stagger,400);
setTimeout(stagger,1500);
const gal=$("#character-gallery");
gal.addEventListener("pointermove",e=>{
  const card = e.target.closest(".cc");
  if (!card || card.classList.contains("flip")) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--ry", ((e.clientX - rect.left) / rect.width - .5) * 18 + "deg");
  card.style.setProperty("--rx", (.5 - (e.clientY - rect.top) / rect.height) * 14 + "deg");
}
);
gal.addEventListener("pointerout",e=>{
  const c=e.target.closest(".cc");if(c){
    c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")
  }
}
);
/* intro gate */
const gate=$("#gate"),killGate=()=>gate&&gate.remove();
if(matchMedia("(prefers-reduced-motion:reduce)").matches)killGate();
else{
  document.body.classList.add("shake");
  gate.onclick=killGate;
  setTimeout(killGate,2700)
}
/* ===== smoke & sparks, thicker the further the horde marches ===== */
(()=>{
  if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;const c=$("#smoke"),x=c.getContext("2d");let W,H;const P=[];
 const rs=()=>{
    W=c.width=innerWidth;H=c.height=innerHeight
  }
  ;rs();addEventListener("resize",rs);
 const spawn=()=>({
    x:Math.random()*W,y:H+10,r:Math.random()*2+.6,v:Math.random()*1.2+.4,d:Math.random()*6,s:Math.random()<.25
  }
  );
 (function f(){
    x.clearRect(0,0,W,H);const b=+getComputedStyle(document.documentElement).getPropertyValue("--burn")||.1;
  while(P.length<20+b*90)P.push(spawn());
  P.forEach((p,i)=>{
      p.y-=p.v;p.d+=.03;p.x+=Math.sin(p.d)*.6;if(p.y<-10)P[i]=spawn();
   x.globalAlpha=p.s?.8:.18;x.fillStyle=p.s?"#f08a24":"#8a8078";x.beginPath();x.arc(p.x,p.y,p.s?p.r:p.r*8,0,7);x.fill()
    }
    );requestAnimationFrame(f)
  }
  )()
}
)();

