/* Shards of the Past — campaign-local runtime. */
async function json(p){const r=await fetch(p);if(!r.ok)throw Error("Nie udało się wczytać pliku: "+p);return r.json();}
function homeButton(){const a=document.createElement("a");a.className="vengrath-home-button";a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const i=document.createElement("img");i.src="/core/graphics/favicon/favicon.ico";i.alt="";const s=document.createElement("span");s.textContent="VENGRATH";a.append(i,s);return a;}
function navbar(mount,color){mount.classList.add("subpage-navbar");const left=document.createElement("div");left.className="subpage-navbar__left";left.append(homeButton());const nav=document.createElement("nav");nav.className="subpage-navbar__sections";nav.setAttribute("aria-label","Sekcje kampanii");const buttons=[["Kampania","campaign"],["Świat","world"]].map(([label,id],i)=>{const b=document.createElement("button");b.type="button";b.className="subpage-navbar-button";b.textContent=label;b.dataset.section=id;b.style.setProperty("--section-color",color);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));nav.append(b);return b;});mount.replaceChildren(left,nav);function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));mount.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}));}const sc=()=>mount.classList.toggle("is-scrolled",window.scrollY>12);sc();window.addEventListener("scroll",sc,{passive:true});select("campaign");}
function hero(c,accent){const h=document.querySelector("#campaign-hero");const heading=h.querySelector("h1");heading.replaceChildren(document.createTextNode(c.heroFirstLine),document.createElement("br"),Object.assign(document.createElement("span"),{className:"shards-hero-title-accent",textContent:c.heroSecondLine}));h.querySelector(".shards-hero-kicker").textContent=c.kicker;h.querySelector(".shards-hero-lead").textContent=c.lead;navbar(document.querySelector("#campaign-navbar"),accent);}
function campaign(c){document.querySelector("#campaign-intro-title").textContent=c.introTitle;document.querySelector("#campaign-intro-copy").replaceChildren(...c.introParagraphs.map(t=>{const p=document.createElement("p");p.textContent=t;return p;}));document.querySelector("#campaign-dossier").replaceChildren(...c.dossier.map(([k,v])=>{const r=document.createElement("div");r.className="ddc-case-row";const s=document.createElement("span");s.textContent=k;const d=document.createElement("strong");d.textContent=v;r.append(s,d);return r;}));document.querySelector("#campaign-audio-kicker").textContent=c.audioKicker;document.querySelector("#campaign-audio-title").textContent=c.audioTitle;}
function world(w){document.querySelector("#world-kicker").textContent=w.kicker;document.querySelector("#world-title").textContent=w.title;document.querySelector("#world-description").textContent=w.description;document.querySelector("#world-grid").replaceChildren(...w.sections.map(item=>{const panel=document.createElement("article");panel.className="ddc-world-panel";const k=document.createElement("div");k.className="ddc-section-mark";k.textContent=item.kicker;const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.description;panel.append(k,h,p);return panel;}));}
class CampaignAudioPlayer{constructor({src,storageKey="vengrath-audio-state",preload="none"}){this.audio=new Audio();this.audio.loop=true;this.audio.preload=preload;this.audio.src=src;this.storageKey=storageKey;this.listeners=new Set();this.audio.volume=.5;this.restore();["play","pause","volumechange","timeupdate","loadedmetadata"].forEach(type=>this.audio.addEventListener(type,()=>{if(type==="loadedmetadata"&&this.pendingTime>0)this.audio.currentTime=Math.min(this.pendingTime,this.audio.duration||this.pendingTime);this.persist();this.emit();}));window.addEventListener("pagehide",()=>this.persist());}restore(){try{const s=JSON.parse(localStorage.getItem(this.storageKey)||"{}");this.audio.volume=Math.max(0,Math.min(1,Number(s.volume??.5)));this.pendingTime=Math.max(0,Number(s.time)||0);}catch{this.pendingTime=0;}}persist(){try{localStorage.setItem(this.storageKey,JSON.stringify({volume:this.audio.volume,time:this.audio.currentTime||0}));}catch{}}snapshot(){return {playing:!this.audio.paused,volume:this.audio.volume,time:this.audio.currentTime||0};}subscribe(fn){this.listeners.add(fn);fn(this.snapshot());return ()=>this.listeners.delete(fn);}emit(){const s=this.snapshot();this.listeners.forEach(fn=>fn(s));}async play(){try{await this.audio.play();}catch(e){if(e?.name!=="NotAllowedError")console.error("Audio playback could not start.",e);}this.emit();}async toggle(){if(this.audio.paused)await this.play();else{this.audio.pause();this.emit();}}setVolume(v){this.audio.volume=Math.max(0,Math.min(1,v));this.persist();this.emit();}}
function mountAudioButton(player,color){const button=document.createElement("button");button.type="button";button.className="audio-player-button";button.style.setProperty("--player-color",color);const ring=document.createElement("span");ring.className="audio-player-ring";const symbol=document.createElement("span");symbol.className="audio-player-symbol";button.append(ring,symbol);let dragging=false;const point=e=>{const r=button.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);let angle=Math.atan2(y,x)+Math.PI/2;if(angle<0)angle+=Math.PI*2;return {radius:Math.hypot(x,y),volume:angle/(Math.PI*2)};};const update=e=>player.setVolume(point(e).volume);button.addEventListener("click",e=>{if(dragging){e.preventDefault();return;}if(point(e).radius>18)update(e);else player.toggle();});button.addEventListener("pointerdown",e=>{if(point(e).radius<=18)return;e.preventDefault();dragging=true;button.setPointerCapture(e.pointerId);update(e);});button.addEventListener("pointermove",e=>{if(dragging)update(e);});button.addEventListener("pointerup",()=>dragging=false);button.addEventListener("pointercancel",()=>dragging=false);player.subscribe(s=>{symbol.textContent=s.playing?"Ⅱ":"▶";button.setAttribute("aria-label",s.playing?"Wstrzymaj audio":"Odtwórz audio");ring.style.setProperty("--volume",s.volume*100+"%");});document.body.append(button);return button;}
async function initialize() {
  const root = document.documentElement;
  const accent =
    getComputedStyle(root).getPropertyValue("--theme-accent-2").trim() || "#5ba9ff";
  const [manifest, content] = await Promise.all([
    json("./manifest.json"),
    json("./content.json"),
  ]);
  hero(content.campaign, accent);
  campaign(content.campaign);

  let worldRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    if (event.detail?.section !== "world" || worldRendered) return;
    world(content.world);
    worldRendered = true;
  });

  const selectedSection = document.querySelector(
    '.subpage-navbar-button[aria-pressed="true"]',
  )?.dataset.section;
  if (selectedSection) {
    document.dispatchEvent(
      new CustomEvent("vengrath:sectionchange", {
        detail: { section: selectedSection },
      }),
    );
  }

  document.querySelector("main")?.setAttribute("aria-busy", "false");
  document.body.classList.remove("is-loading");
  const audio = new CampaignAudioPlayer({
    src: manifest.audio.src,
    storageKey: manifest.audio.continuationKey,
    preload: "none",
  });
  const audioColor =
    getComputedStyle(root).getPropertyValue("--theme-audio-color").trim() || "#ff344d";
  mountAudioButton(audio, audioColor);
}
initialize().catch(e=>{console.error("Nie udało się uruchomić strony Shards of the Past.",e);document.querySelectorAll(".ddc-tab-panel").forEach(p=>p.hidden=true);document.querySelector("#load-error").hidden=false;document.querySelector("main")?.setAttribute("aria-busy", "false");document.body.classList.remove("is-loading");});
