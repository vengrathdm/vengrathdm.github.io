import { Delaunay } from "https://cdn.jsdelivr.net/npm/d3-delaunay@6.0.4/+esm";

const $=s=>document.querySelector(s);
const viewport=$("#viewport"),board=$("#board"),filters=$("#filters"),search=$("#search"),emptyState=$("#empty-state"),preview=$("#preview"),contextMenu=$("#card-context-menu"),contextPreview=$("#context-preview-backdrop");
let records=[],activeTags=new Set(),resizeFrame=0,previewEnabled=false;
let worldWidth=0,dragging=false,lastPointerX=0,lastMoveTime=0,velocity=0,inertiaFrame=0;
let suppressClick=false,pressedCardHref=null;

function seededRandom(seed){let v=seed>>>0;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296}}

function describe(r){const tags=r.tags||[];if(tags.includes("Aktywna"))return"Aktywna kampania w kolekcji Vengrath.";if(tags.includes("Zamknięta"))return"Zakończona kampania zachowana w kolekcji Vengrath.";if(tags.includes("W przygotowaniu"))return"Projekt przygotowywany do przyszłej realizacji.";if(tags.includes("Narzędzie"))return"Interaktywne narzędzie z kolekcji Vengrath.";if(tags.includes("Archiwum"))return"Kronika zachowana w archiwum Vengrath.";return"Odkryj tę część kolekcji Vengrath."}
function normalize(v){return String(v??"").trim().toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function visibleRecords(){const q=normalize(search.value);return records.filter(r=>r.visibility!=="hidden"&&[...activeTags].every(tag=>(r.tags||[]).includes(tag))&&(!q||normalize(r.title).includes(q)||(r.tags||[]).some(tag=>normalize(tag).includes(q))))}
function renderFilters(){filters.replaceChildren();const available=new Set(records.filter(r=>r.visibility!=="hidden").flatMap(r=>r.tags||[]));const priority=["Aktywna","Zamknięta","Kampania","Homebrew","Third-Party","Forgotten Realms","Ravenloft","Call of Cthulhu","Planescape","Narzędzie","Archiwum","MG"];const tags=[...priority.filter(tag=>available.has(tag)),...([...available].filter(tag=>!priority.includes(tag)).sort((a,b)=>a.localeCompare(b,"pl")))];["Wszystko",...tags].forEach(label=>{const b=document.createElement("button");b.type="button";b.className="filter";b.textContent=label;b.dataset.tag=label;filters.append(b)});syncFilterControls()}
function syncFilterControls(){filters.querySelectorAll("button[data-tag]").forEach(b=>{const active=b.dataset.tag==="Wszystko"?!activeTags.size:activeTags.has(b.dataset.tag);b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});$("#clear-active-filters").hidden=!activeTags.size&&!search.value}
function svgEl(name,attrs={}){const e=document.createElementNS("http://www.w3.org/2000/svg",name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function pathOf(poly){return"M"+poly.map(p=>p.join(",")).join("L")+"Z"}
function fitText(group,text,x,y,maxWidth,maxLines,fontSize,className,letterSpacing=0){
 const el=svgEl("text",{x,y,class:className,"font-size":fontSize,"letter-spacing":letterSpacing});
 const words=String(text||"").split(/\s+/);let lines=[],line="";
 const charWidth=fontSize*(className==="cell-title"?.54:.62)+letterSpacing;
 const capacity=Math.max(5,Math.floor(maxWidth/charWidth));
 for(const word of words){const next=line?line+" "+word:word;if(next.length>capacity&&line){lines.push(line);line=word}else line=next}
 if(line)lines.push(line);
 let shown=lines.slice(0,maxLines);
 if(lines.length>maxLines&&shown.length){let last=shown[shown.length-1];shown[shown.length-1]=last.slice(0,Math.max(2,capacity-1)).trim()+"…"}
 const lineHeight=fontSize*(className==="cell-title"?1.05:1.35);
 shown.forEach((part,i)=>{const span=svgEl("tspan",{x,dy:i===0?0:lineHeight});span.textContent=part;el.append(span)});
 group.append(el);return shown.length*lineHeight;
}
const prefetchedPages=new Set(),prefetchedAssets=new Set(),inspectedStylesheets=new Set();
const PREFETCH_LIMIT=4;
let activePrefetches=0;
const prefetchQueue=[];
function schedulePrefetch(task){prefetchQueue.push(task);drainPrefetchQueue()}
function drainPrefetchQueue(){while(activePrefetches<PREFETCH_LIMIT&&prefetchQueue.length){const task=prefetchQueue.shift();activePrefetches++;Promise.resolve().then(task).catch(()=>{}).finally(()=>{activePrefetches--;drainPrefetchQueue()})}}
const PREFETCH_ORIGINS=new Set([location.origin,"https://cdn.jsdelivr.net","https://fonts.googleapis.com","https://fonts.gstatic.com"]);
function allowedPrefetchUrl(value,base=location.href){
 try{const url=new URL(value,base);return /^https?:$/.test(url.protocol)&&PREFETCH_ORIGINS.has(url.origin)?url:null}catch{return null}
}
function addPrefetch(value,as,base=location.href,priority="low"){
 const url=allowedPrefetchUrl(value,base);if(!url||prefetchedAssets.has(url.href))return null;
 prefetchedAssets.add(url.href);
 const link=document.createElement("link");
 link.rel="prefetch";link.href=url.href;link.as=as;link.fetchPriority=priority;
 if(as==="font")link.crossOrigin="anonymous";
 document.head.append(link);return url.href;
}
function addModulePreload(value,base=location.href){
 const url=allowedPrefetchUrl(value,base);if(!url||prefetchedAssets.has(url.href))return;
 prefetchedAssets.add(url.href);
 const link=document.createElement("link");link.rel="modulepreload";link.href=url.href;link.crossOrigin=url.origin===location.origin?"same-origin":"anonymous";link.fetchPriority="low";document.head.append(link);
}
function cssResources(css,base){
 const imports=[...css.matchAll(/@import\\s+(?:url\\()?['"]?([^'")\\s;]+)['"]?\\)?/gi)].map(m=>m[1]);
 const fonts=[...css.matchAll(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/gi)].map(m=>m[2]).filter(url=>/\.(?:woff2?|ttf|otf)(?:[?#]|$)/i.test(url));
 imports.slice(0,2).forEach(url=>{const href=allowedPrefetchUrl(url,base);if(href)inspectStylesheet(href.href)});
 fonts.slice(0,6).forEach(url=>addPrefetch(url,"font",base));
}
async function inspectStylesheet(href){
 const url=allowedPrefetchUrl(href);if(!url||inspectedStylesheets.has(url.href))return;
 inspectedStylesheets.add(url.href);
 schedulePrefetch(async()=>{try{const response=await fetch(url.href,{mode:"cors",credentials:url.origin===location.origin?"same-origin":"omit"});if(response.ok)cssResources(await response.text(),url.href)}catch{}});
}
function prefetchDocumentAssets(doc,pageUrl){
 const styles=[...doc.querySelectorAll('link[rel~="stylesheet"][href]')].map(el=>el.href).slice(0,4);
 styles.forEach(href=>{const url=addPrefetch(href,"style",pageUrl);if(url)inspectStylesheet(url)});
 const moduleScripts=[...doc.querySelectorAll('script[type="module"][src]')].map(el=>el.src).slice(0,4);
 moduleScripts.forEach(src=>addModulePreload(src,pageUrl));
 const classicScripts=[...doc.querySelectorAll('script[src]:not([type="module"])')].map(el=>el.src).slice(0,3);
 classicScripts.forEach(src=>addPrefetch(src,"script",pageUrl));
 const images=[];
 doc.querySelectorAll("img[src],img[srcset],source[srcset],meta[property='og:image'][content]").forEach(el=>{
  const src=el.getAttribute("src")||el.getAttribute("content")||el.getAttribute("srcset")?.split(",")[0]?.trim().split(/\\s+/)[0];
  if(src)images.push(new URL(src,pageUrl).href);
 });
 doc.querySelectorAll("[style]").forEach(el=>{for(const match of el.getAttribute("style").matchAll(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/gi))images.push(new URL(match[2],pageUrl).href)});
 [...new Set(images)].slice(0,6).forEach(src=>addPrefetch(src,"image",pageUrl));
 doc.querySelectorAll("style").forEach(el=>cssResources(el.textContent,pageUrl));
}
async function prefetchPage(record){
 if(!record?.url)return;
 const url=allowedPrefetchUrl(record.url);if(!url||url.origin!==location.origin||prefetchedPages.has(url.href))return;
 prefetchedPages.add(url.href);
 const link=document.createElement("link");link.rel="prefetch";link.href=url.href;link.as="document";link.fetchPriority="low";document.head.append(link);
 try{
  const response=await fetch(url.href,{credentials:"same-origin"});
  if(!response.ok)return;
  const html=await response.text(),doc=new DOMParser().parseFromString(html,"text/html");
  prefetchDocumentAssets(doc,url.href);
 }catch(error){console.debug("Page asset prefetch skipped",url.href,error)}
}
function makeWorld(items,width,height,rows){
 const cols=Math.ceil(items.length/rows),cellW=width/cols,cellH=height/rows;
 const baseSites=items.map((record,i)=>{
  const col=i%cols,row=Math.floor(i/cols),random=seededRandom(93517+i*7919+items.length*31);
  const stagger=(row%2?-.13:.13)*cellW;
  return[(col+.5)*cellW+stagger+(random()-.5)*cellW*.3,(row+.5)*cellH+(random()-.5)*cellH*.3,record,i];
 });
 // Build one continuous three-world surface. Ghost worlds keep Voronoi cells
 // crossing each join naturally instead of clipping them into straight edges.
 const sites=[];
 for(let copy=-1;copy<=3;copy++)for(const site of baseSites)sites.push([site[0]+copy*width,site[1],site[2],copy,site[3]]);
 const totalWidth=width*3;
 const delaunay=Delaunay.from(sites,d=>d[0],d=>d[1]),voronoi=delaunay.voronoi([0,0,totalWidth,height]);
 const svg=svgEl("svg",{width:totalWidth,height,viewBox:`0 0 ${totalWidth} ${height}`,role:"group","aria-label":"Kolekcja wpisów Vengrath"});
 const defs=svgEl("defs");svg.append(defs);
 sites.forEach((site,i)=>{
  const [sx,sy,record,copy,itemIndex]=site;
  if(copy<0||copy>2)return;
  const poly=voronoi.cellPolygon(i);if(!poly||poly.length<3)return;
  const id=`h2-${copy}-${itemIndex}`,d=pathOf(poly),clip=svgEl("clipPath",{id});clip.append(svgEl("path",{d}));defs.append(clip);
  const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  const anchor=svgEl("a",{href:record.url,class:"cell",tabindex:"0","aria-label":record.title+" — "+(record.tags||[]).join(", ")});
  const image=svgEl("image",{x,y,width:w,height:h,href:record.image||"","preserveAspectRatio":"xMidYMid slice","clip-path":`url(#${id})`,class:"cell-image",fetchpriority:copy===1?"high":"low",decoding:"async"});
  anchor.append(image,svgEl("path",{d,class:"cell-shade"}));
  const labels=svgEl("g",{"clip-path":`url(#${id})`});
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
  const safeW=Math.max(50,w*.72),safeH=Math.max(34,h*.58);
  const titleSize=Math.max(12,Math.min(23,safeW/(Math.min(record.title.length,18)*.57),safeH*.36));
  const titleLines=fitText(labels,record.title,cx,cy-titleSize*.45,safeW,2,titleSize,"cell-title");
  const categoryY=cy+Math.max(14,titleLines*titleSize*.72)+7;
  fitText(labels,(record.tags||[]).join(" · "),cx,categoryY,safeW,2,Math.max(7.5,Math.min(9.5,safeW/24)),"cell-tag",.3);
  anchor.append(labels);
  anchor.addEventListener("pointerenter",()=>{prefetchPage(record);showPreview(record)});anchor.addEventListener("pointerleave",hidePreview);
  anchor.addEventListener("contextmenu",e=>{e.preventDefault();openContextMenu(record,e.clientX,e.clientY)});
  anchor.addEventListener("focus",()=>{prefetchPage(record);showPreview(record)});anchor.addEventListener("blur",hidePreview);
  svg.append(anchor);
 });
 return svg;
}
function build(){
 const items=visibleRecords();board.replaceChildren();emptyState.hidden=items.length>0;
 if(!items.length){worldWidth=0;return}
 const viewportHeight=viewport.clientHeight;
 const worldHeight=Math.max(220,viewportHeight-58);
 const maxRows=innerWidth<680?4:5;
 const rows=items.length<=3?1:items.length<=8?2:items.length<=15?3:items.length<=24?4:maxRows;
 const cols=Math.ceil(items.length/rows);
 const cellH=worldHeight/rows;
 const cellW=cellH*1.6;
 worldWidth=cols*cellW;
 board.append(makeWorld(items,worldWidth,worldHeight,rows));
 board.style.height=worldHeight+"px";
 const oldWorld=viewport.scrollLeft;
 viewport.scrollLeft=worldWidth+Math.min(oldWorld%Math.max(1,worldWidth),worldWidth*.45);
}
function showPreview(r,force=false){if(!previewEnabled&&!force)return;$("#preview-image").src=r.image||"";$("#preview-image").alt=r.title;$("#preview-category").textContent=(r.tags||[]).join(" · ")||"Kolekcja Vengrath";$("#preview-title").textContent=r.title;$("#preview-description").textContent=describe(r);preview.dataset.href=r.url;preview.setAttribute("aria-hidden","false");preview.style.opacity="1";preview.style.transform="translateY(0)"}
function hidePreview(){preview.style.opacity="0";preview.style.transform="translateY(0)";preview.setAttribute("aria-hidden","true")}

function openContextPreview(record){
 $("#context-preview-image").src=record.image||"";
 $("#context-preview-image").alt=record.title||"";
 $("#context-preview-category").textContent=(record.tags||[]).join(" · ")||"Kolekcja Vengrath";
 $("#context-preview-title").textContent=record.title||"";
 $("#context-preview-description").textContent=describe(record);
 $("#context-preview-open").href=record.url;
 hidePreview();
 contextPreview.hidden=false;
 contextPreview.classList.add("is-open");
}
function closeContextPreview(){
 if(contextPreview.hidden)return;
 contextPreview.classList.remove("is-open");
 contextPreview.hidden=true;
}
$("#context-preview-close").addEventListener("click",closeContextPreview);
function closeContextMenu(){contextMenu.classList.remove("is-open");contextMenu.hidden=true;contextMenu.removeAttribute("data-url");contextMenu.removeAttribute("data-image");contextMenu.removeAttribute("data-title")}
function openContextMenu(record,x,y){
 contextMenu.dataset.url=new URL(record.url,location.href).href;
 contextMenu.dataset.image=new URL(record.image,location.href).href;
 contextMenu.dataset.title=record.title||"";
 contextMenu.hidden=false;contextMenu.classList.add("is-open");
 const pad=10,rect=contextMenu.getBoundingClientRect();
 const left=Math.max(pad,Math.min(x,innerWidth-rect.width-pad));
 const top=Math.max(pad,Math.min(y,innerHeight-rect.height-pad));
 contextMenu.style.left=left+"px";contextMenu.style.top=top+"px";

}
async function copyAddress(value){
 try{await navigator.clipboard.writeText(value)}
 catch(error){
  const field=document.createElement("textarea");field.value=value;field.style.position="fixed";field.style.opacity="0";document.body.append(field);field.select();
  const copied=document.execCommand("copy");field.remove();if(!copied)throw error;
 }
}
contextMenu.addEventListener("click",async e=>{
 const button=e.target.closest("button[data-action]");if(!button)return;
 const action=button.dataset.action,url=contextMenu.dataset.url,image=contextMenu.dataset.image,title=contextMenu.dataset.title;
 closeContextMenu();
 if(action==="preview"){const record=records.find(r=>new URL(r.url,location.href).href===url);if(record)openContextPreview(record)}
 if(action==="new-tab")window.open(url,"_blank","noopener,noreferrer");
 if(action==="open-image")window.open(image,"_blank","noopener,noreferrer");
 if(action==="copy-image")try{await copyAddress(image);button.blur()}catch(error){console.warn("Could not copy image URL",error)}
 if(action==="copy-link")try{await copyAddress(url);button.blur()}catch(error){console.warn("Could not copy link address",error)}
});
document.addEventListener("pointerdown",e=>{if(!contextMenu.hidden&&!contextMenu.contains(e.target))closeContextMenu()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!contextMenu.hidden)closeContextMenu();if(!contextPreview.hidden)closeContextPreview()}});
viewport.addEventListener("scroll",()=>{if(!contextMenu.hidden)closeContextMenu()},{passive:true});
window.addEventListener("resize",closeContextMenu);

function wrapScroll(){if(!worldWidth)return;let x=viewport.scrollLeft;while(x<worldWidth){x+=worldWidth}while(x>=worldWidth*2){x-=worldWidth}if(x!==viewport.scrollLeft)viewport.scrollLeft=x}
function stopInertia(){if(inertiaFrame)cancelAnimationFrame(inertiaFrame);inertiaFrame=0}
function runInertia(){stopInertia();let last=performance.now();const tick=now=>{const dt=Math.min(32,now-last);last=now;if(Math.abs(velocity)<.025){velocity=0;inertiaFrame=0;return}viewport.scrollLeft-=velocity*dt;velocity*=Math.pow(.93,dt/16.67);wrapScroll();inertiaFrame=requestAnimationFrame(tick)};inertiaFrame=requestAnimationFrame(tick)}
filters.addEventListener("click",e=>{const b=e.target.closest("button[data-tag]");if(!b)return;if(b.dataset.tag==="Wszystko")activeTags.clear();else{if(activeTags.has(b.dataset.tag))activeTags.delete(b.dataset.tag);else activeTags.add(b.dataset.tag)}syncFilterControls();hidePreview();build()});
search.addEventListener("input",()=>{syncFilterControls();hidePreview();build()});
$("#clear-filters").addEventListener("click",()=>{search.value="";activeTags.clear();syncFilterControls();hidePreview();build()});
$("#clear-active-filters").addEventListener("click",()=>{$("#search").value="";activeTags.clear();syncFilterControls();hidePreview();build()});
$("#preview-toggle").addEventListener("click",()=>{previewEnabled=!previewEnabled;const button=$("#preview-toggle");button.setAttribute("aria-pressed",String(previewEnabled));if(!previewEnabled)hidePreview()});
viewport.addEventListener("scroll",wrapScroll,{passive:true});
viewport.addEventListener("wheel",e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();viewport.scrollLeft+=e.deltaY}},{passive:false});
viewport.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;pressedCardHref=e.pointerType==="mouse"&&e.button===0?e.target.closest(".cell")?.getAttribute("href")||null:null;stopInertia();dragging=true;suppressClick=false;lastPointerX=e.clientX;lastMoveTime=performance.now();velocity=0;viewport.classList.add("dragging");viewport.setPointerCapture?.(e.pointerId)});
viewport.addEventListener("pointermove",e=>{if(!dragging)return;const now=performance.now(),dx=e.clientX-lastPointerX,dt=Math.max(1,now-lastMoveTime);viewport.scrollLeft-=dx;velocity=dx/dt;lastPointerX=e.clientX;lastMoveTime=now;if(Math.abs(dx)>3)suppressClick=true;wrapScroll()});
const endDrag=()=>{if(!dragging)return;dragging=false;viewport.classList.remove("dragging");const destination=pressedCardHref;pressedCardHref=null;if(destination&&!suppressClick)location.assign(new URL(destination,location.href).href);runInertia()};
viewport.addEventListener("pointerup",endDrag);viewport.addEventListener("pointercancel",endDrag);viewport.addEventListener("lostpointercapture",endDrag);
viewport.addEventListener("click",e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;return}if(!e.target.closest(".cell")&&preview.dataset.href)hidePreview()},true);
window.addEventListener("resize",()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(build)});
async function init(){const response=await fetch("/core/data/site-pages.json");if(!response.ok)throw new Error("Could not load Vengrath page registry");records=(await response.json()).filter(r=>typeof r.url==="string"&&r.url.startsWith("/")&&!r.url.startsWith("//")&&typeof r.title==="string"&&typeof r.image==="string");renderFilters();build()}
init().catch(error=>{console.error(error);board.textContent="Nie udało się wczytać kolekcji Vengrath.";board.style.color="#ffb4b4";});
