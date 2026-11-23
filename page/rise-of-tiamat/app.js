async function loadJson(path){const r=await fetch(path);if(!r.ok)throw new Error("Nie udało się wczytać "+path+" ("+r.status+")");return r.json()}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function makeHome(){const a=el("a","vengrath-home-button");a.href="/home/";a.setAttribute("aria-label","Vengrath — strona główna");const img=el("img");img.src="/core/graphics/favicon/favicon.ico";img.alt="";a.append(img,el("span","", "VENGRATH"));return a}
function makePlaylist(url){const a=el("a","youtube-playlist-button");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.append(el("span","","YouTube"),el("span","","Playlista"));return a}
function mountNavbar(manifest,theme){const nav=el("div","subpage-navbar rot-navbar-mount");const left=el("div","subpage-navbar__left");left.append(makeHome());if(manifest.playlistUrl)left.append(makePlaylist(manifest.playlistUrl));const right=el("nav","subpage-navbar__sections");right.setAttribute("aria-label","Sekcje kampanii");const sections=[["Kampania","campaign"],["Postaci","characters"],["Kronika","chronicle"]];const buttons=sections.map(([label,id],i)=>{const b=el("button","subpage-navbar-button",label);b.type="button";b.dataset.section=id;b.style.setProperty("--section-color",theme.colors.accent2);b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>select(id));right.append(b);return b});function select(id){document.querySelectorAll("[data-page-section]").forEach(s=>s.hidden=s.dataset.pageSection!==id);buttons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.section===id)));nav.dispatchEvent(new CustomEvent("vengrath:sectionchange",{bubbles:true,detail:{section:id}}))}nav.append(left,right);document.body.prepend(nav);const update=()=>nav.classList.toggle("is-scrolled",scrollY>12);update();window.addEventListener("scroll",update,{passive:true});select("campaign")}
async function renderGallery(container,ids){const [cr,ar]=await Promise.all([fetch("/core/data/characters.json"),fetch("/core/data/achievements.json")]);if(!cr.ok||!ar.ok)throw Error("Nie udało się wczytać katalogu postaci");const [characters,achievements]=await Promise.all([cr.json(),ar.json()]);const byId=new Map(characters.map(c=>[c.id,c]));const defs=new Map(achievements.map(a=>[a.id,a]));const selected=[...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);container.replaceChildren();if(!selected.length){container.append(el("p","character-gallery__empty","Brak postaci spełniających kryteria."));return}const grid=el("div","character-gallery");for(const c of selected){const card=el("article","character-card");card.dataset.status=c.status||"";card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","Otwórz rekord postaci "+(c.character||""));const badges=el("div","character-card__achievements");(c.achievementIds||[]).map(id=>defs.get(id)).filter(Boolean).forEach(a=>{const badge=el("span","achievement-badge",a.icon||"✦");badge.title=a.name||a.id;badges.append(badge)});const portrait=el("div","character-card__portrait");const image=el("img");image.src=c.portrait;image.alt=c.character||"Portret postaci";image.loading="lazy";portrait.append(image,el("span","character-card__status",c.status||""));const body=el("div","character-card__body");body.append(el("h3","",c.character||"Nieznana postać"),el("p","character-card__player",c.player||"Nie podano"));for(const [label,value] of [["Kampanie",c.campaigns],["Klasy",c.classes],["Rasa",c.race]]){const row=el("div","character-card__row");row.append(el("span","character-card__label",label),el("span","character-card__value",Array.isArray(value)?value.join(", "):value||"Nie podano"));body.append(row)}const earned=(c.achievementIds||[]).filter(id=>defs.has(id)).length;card.append(badges,portrait,body,el("p","character-card__achievement-count",earned?earned+" osiągnięć":"Brak zdobytych osiągnięć"));card.addEventListener("click",()=>card.dispatchEvent(new CustomEvent("characterselect",{bubbles:true,detail:{character:c}})));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click()}});grid.append(card)}container.append(grid)}
function ytTarget(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,"").toLowerCase();if(host==="youtu.be")return{videoId:u.pathname.split("/").filter(Boolean)[0]};if(host.endsWith("youtube.com")||host.endsWith("youtube-nocookie.com")){const videoId=u.searchParams.get("v")||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];const playlistId=u.searchParams.get("list");if(videoId)return{videoId,playlistId};if(playlistId)return{playlistId}}}catch{}return null}
let activeClose=null;
function makeChronicle(session,accent){const article=el("article","chronicle-record");article.style.setProperty("--chronicle-accent",accent);const header=el("div","chronicle-record__header");header.tabIndex=0;header.setAttribute("role","button");header.setAttribute("aria-expanded","false");const raw=String(session.sessionNumber??session.number??"—").trim();const match=raw.match(/^S?0*(\d+)([A-Z]?)$/i);const number=match?String(Number(match[1])).padStart(2,"0")+match[2].toUpperCase():raw;const titleRaw=String(session.title||"Bez tytułu").trim();const titleValue=titleRaw.replace(/^.*?\bS\d+(?:P\d+)?\s*[-–—:]\s*/i,"").replace(/^.*?#\s*\d+\s*[-–—:]\s*/i,"").replace(/\s+S\d+(?:P\d+)?\s*\[[^\]]+\]$/i,"").trim()||titleRaw;header.append(el("span","chronicle-record__number",number),el("span","chronicle-record__title",titleValue));const date=el("time","chronicle-record__date",session.date||"");date.hidden=!session.date;if(session.date){const m=session.date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);date.dateTime=m?m[3]+"-"+m[2]+"-"+m[1]:session.date}const recordings=el("div","chronicle-record__recordings");const players=el("div","chronicle-record__players");const links=Array.isArray(session.recordings)?session.recordings:[];recordings.hidden=!links.length;links.forEach((rec,i)=>{const part=rec.partNumber||(links.length>1?i+1:null);const label=links.length>1?"Odtwórz Część "+(part||i+1):"Odtwórz";const target=ytTarget(rec.url);if(target){const btn=el("button","chronicle-inline-player__toggle",label);btn.type="button";btn.setAttribute("aria-expanded","false");const panel=el("section","chronicle-inline-player");panel.hidden=true;const phead=el("header","chronicle-inline-player__header");phead.append(el("strong","chronicle-inline-player__title",titleValue),el("span","chronicle-inline-player__tag","NAGRANIE · YOUTUBE"));const video=el("div","chronicle-inline-player__video");const foot=el("footer","chronicle-inline-player__footer");const meta=el("span","", "SESJA "+number+(part?" · CZĘŚĆ "+part:""));const ext=el("a","","OTWÓRZ W YOUTUBE ↗");ext.href=rec.url;ext.target="_blank";ext.rel="noopener noreferrer";foot.append(meta,ext);panel.append(phead,video,foot);const close=()=>{video.replaceChildren();panel.hidden=true;btn.setAttribute("aria-expanded","false");btn.textContent=label;if(activeClose===close)activeClose=null};btn.addEventListener("click",e=>{e.stopPropagation();if(!panel.hidden){close();return}if(activeClose)activeClose();const iframe=el("iframe");iframe.src=target.videoId?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(target.videoId)+(target.playlistId?"?list="+encodeURIComponent(target.playlistId)+"&rel=0":"?rel=0"):"https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(target.playlistId);iframe.title=titleValue;iframe.loading="lazy";iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";iframe.referrerPolicy="strict-origin-when-cross-origin";iframe.allowFullscreen=true;video.replaceChildren(iframe);panel.hidden=false;btn.setAttribute("aria-expanded","true");btn.textContent="ZAMKNIJ";activeClose=close});recordings.append(btn);players.append(panel)}else if(rec.url){const a=el("a","play-recording-button",label+" ▶");a.href=rec.url;a.target="_blank";a.rel="noopener noreferrer";a.addEventListener("click",e=>e.stopPropagation());recordings.append(a)}});recordings.addEventListener("click",e=>e.stopPropagation());header.append(date,recordings);const description=el("div","chronicle-record__description");description.hidden=true;description.append(el("p","",session.description||session.notes||""));const toggle=()=>{const open=description.hidden;description.hidden=!open;header.setAttribute("aria-expanded",String(open));article.classList.toggle("is-expanded",open)};header.addEventListener("click",toggle);header.addEventListener("keydown",e=>{if(e.target===header&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggle()}});article.append(header,players,description);return article}
async function initialize() {
  const [manifest, theme, content] = await Promise.all([
    loadJson("./manifest.json"),
    loadJson("./theme.json"),
    loadJson("./content.json"),
  ]);
  const root = document.documentElement;
  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    root.style.setProperty("--theme-" + key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()), value);
  });
  root.style.setProperty("--theme-font-1", theme.typography.heading);
  root.style.setProperty("--theme-font-2", theme.typography.body);
  root.style.setProperty("--theme-font-3", theme.typography.serif);
  root.style.setProperty("--campaign-accent", theme.colors.accent2);

  const hero = document.querySelector("#campaign-hero");
  hero.style.setProperty("--hero-background", "url('" + theme.heroImage + "')");
  hero.querySelector(".rot-hero-kicker").textContent = content.campaign.kicker;
  const heading = hero.querySelector("h1");
  heading.replaceChildren(
    document.createTextNode("Rise of"),
    document.createElement("br"),
    el("em", "rot-hero-title-accent", "Tiamat"),
  );
  hero.querySelector(".rot-hero-lead").textContent = content.campaign.lead;
  mountNavbar(manifest, theme);

  document.querySelector("#campaign-intro-title").textContent = content.campaign.introTitle;
  document.querySelector("#campaign-intro-copy").replaceChildren(
    ...(content.campaign.introParagraphs || []).map((text) => el("p", "", text)),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...(content.campaign.dossier || []).map(([label, value]) => {
      const row = el("div", "rot-dossier-row");
      row.append(el("span", "", label), el("strong", label === "STATUS" ? "rot-active" : "", value));
      return row;
    }),
  );
  document.querySelector("#characters-kicker").textContent = content.characters.kicker;
  document.querySelector("#characters-title").textContent = content.characters.title;
  document.querySelector("#characters-description").textContent = content.characters.description;

  let galleryPromise;
  let chronicleRendered = false;
  document.addEventListener("vengrath:sectionchange", (event) => {
    const section = event.detail?.section;
    if (section === "characters" && !galleryPromise) {
      const gallery = document.querySelector("#tiamat-character-gallery");
      galleryPromise = renderGallery(gallery, content.characters.characterIds || []).catch((error) => {
        console.error("Nie udało się wczytać galerii postaci.", error);
        galleryPromise = null;
        gallery.replaceChildren(el("p", "character-gallery__empty", "Nie udało się wczytać galerii postaci."));
      });
    }
    if (section === "chronicle" && !chronicleRendered) {
      document.querySelector("#chronicle-playlist").href =
        content.chronicle.playlistUrl || manifest.playlistUrl || "#";
      document.querySelector("#chronicle-records").replaceChildren(
        ...(content.chronicle.sessions || []).map((session) =>
          makeChronicle(session, theme.colors.accent2),
        ),
      );
      chronicleRendered = true;
    }
  });

  document.body.classList.remove("campaign-startup-loading");
}
initialize().catch((error) => {
  console.error("Nie udało się uruchomić strony Rise of Tiamat.", error);
  document.body.classList.remove("campaign-startup-loading");
  const message = el(
    "p",
    "rot-load-error",
    "Nie udało się wczytać kampanii. Odśwież stronę lub spróbuj ponownie później.",
  );
  message.setAttribute("role", "alert");
  document.body.prepend(message);
});
