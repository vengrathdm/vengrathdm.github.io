import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const $=s=>document.querySelector(s);
const viewport=$("#viewport"),board=$("#board"),filters=$("#filters"),search=$("#search"),emptyState=$("#empty-state"),preview=$("#preview");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let records=[],activeTags=new Set(),resizeFrame=0,previewTween,previewEnabled=true;
let renderer,scene,camera,clock,particleGeometry,particleMaterial;
let worldWidth=0,dragging=false,lastPointerX=0,lastMoveTime=0,velocity=0,inertiaFrame=0;
let suppressClick=false;

function seededRandom(seed){let v=seed>>>0;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296}}
function startAtmosphere(){
 const canvas=$("#atmosphere");
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0,0);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,100);camera.position.z=32;clock=new THREE.Clock();
  const count=680,positions=new Float32Array(count*3),random=seededRandom(271828);
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*62;positions[i*3+1]=(random()-.5)*36;positions[i*3+2]=(random()-.5)*24}
  particleGeometry=new THREE.BufferGeometry();particleGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  particleMaterial=new THREE.PointsMaterial({color:0xe7e9ef,size:1.45,transparent:true,opacity:.62,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const stars=new THREE.Points(particleGeometry,particleMaterial);scene.add(stars);
  const animate=()=>{requestAnimationFrame(animate);const t=clock.getElapsedTime();stars.rotation.y=Math.sin(t*.04)*.04;stars.rotation.x=Math.cos(t*.03)*.02;const p=particleGeometry.attributes.position.array;
   for(let i=0;i<count;i++){p[i*3+1]+=.002+(i%7)*.0003;if(p[i*3+1]>19)p[i*3+1]=-19}
   particleGeometry.attributes.position.needsUpdate=true;renderer.render(scene,camera)};
  animate();
  addEventListener("resize",()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
 }catch(e){console.warn("WebGL atmosphere unavailable",e);canvas.hidden=true}
}
function describe(r){if(r.type==="tool")return"Interaktywne narzędzie z kolekcji Vengrath.";if(r.category==="Aktywna Kampania")return"Aktywna kampania w kolekcji Vengrath.";if(r.category==="Zamknięta Kampania")return"Zakończona kampania zachowana w archiwum Vengrath.";if(r.category==="Archiwum")return"Kronika zachowana w archiwum Vengrath.";return"Odkryj tę część kolekcji Vengrath."}
function normalize(v){return String(v??"").trim().toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function visibleRecords(){const q=normalize(search.value);return records.filter(r=>{if(r.visibility==="hidden")return q==="hidden"||q===normalize(r.title);return(!activeTags.size||activeTags.has(r.category))&&(!q||normalize(r.title).includes(q)||normalize(r.category).includes(q))})}
function renderFilters(){filters.replaceChildren();const cats=[...new Set(records.filter(r=>r.visibility!=="hidden").map(r=>r.category).filter(Boolean))];["Wszystko",...cats].forEach(label=>{const b=document.createElement("button");b.type="button";b.className="filter";b.textContent=label;b.dataset.tag=label;filters.append(b)});syncFilterControls()}
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
 const delaunay=d3.Delaunay.from(sites,d=>d[0],d=>d[1]),voronoi=delaunay.voronoi([0,0,totalWidth,height]);
 const svg=svgEl("svg",{width:totalWidth,height,viewBox:`0 0 ${totalWidth} ${height}`,role:"group","aria-label":"Kolekcja kampanii Vengrath"});
 const defs=svgEl("defs");svg.append(defs);
 sites.forEach((site,i)=>{
  const [sx,sy,record,copy,itemIndex]=site;
  if(copy<0||copy>2)return;
  const poly=voronoi.cellPolygon(i);if(!poly||poly.length<3)return;
  const id=`h2-${copy}-${itemIndex}`,d=pathOf(poly),clip=svgEl("clipPath",{id});clip.append(svgEl("path",{d}));defs.append(clip);
  const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  const anchor=svgEl("a",{href:record.url,class:"cell",tabindex:"0","aria-label":record.title+" — "+(record.category||"Vengrath")});
  const image=svgEl("image",{x,y,width:w,height:h,href:record.image||"","preserveAspectRatio":"xMidYMid slice","clip-path":`url(#${id})`,class:"cell-image"});
  anchor.append(image,svgEl("path",{d,class:"cell-shade"}));
  const labels=svgEl("g",{"clip-path":`url(#${id})`});
  const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
  const safeW=Math.max(50,w*.72),safeH=Math.max(34,h*.58);
  const titleSize=Math.max(12,Math.min(23,safeW/(Math.min(record.title.length,18)*.57),safeH*.36));
  const titleLines=fitText(labels,record.title,cx,cy-titleSize*.45,safeW,2,titleSize,"cell-title");
  const categoryY=cy+Math.max(14,titleLines*titleSize*.72)+7;
  fitText(labels,record.category||"",cx,categoryY,safeW,2,Math.max(7.5,Math.min(9.5,safeW/24)),"cell-tag",.3);
  anchor.append(labels);
  anchor.addEventListener("pointerenter",()=>showPreview(record));anchor.addEventListener("pointerleave",hidePreview);
  anchor.addEventListener("focus",()=>showPreview(record));anchor.addEventListener("blur",hidePreview);
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
 if(!reducedMotion)gsap.from(board.querySelectorAll(".cell"),{autoAlpha:0,scale:.97,transformOrigin:"50% 50%",duration:.65,stagger:{each:.009,from:"random"},ease:"power2.out",clearProps:"all"});
}
function showPreview(r){if(!previewEnabled)return;$("#preview-image").src=r.image||"";$("#preview-image").alt=r.title;$("#preview-category").textContent=r.category||"Kolekcja Vengrath";$("#preview-title").textContent=r.title;$("#preview-description").textContent=describe(r);preview.dataset.href=r.url;preview.setAttribute("aria-hidden","false");previewTween?.kill();previewTween=gsap.to(preview,{autoAlpha:1,y:0,duration:.22,ease:"power2.out",overwrite:true})}
function hidePreview(){previewTween?.kill();previewTween=gsap.to(preview,{autoAlpha:0,y:10,duration:.16,ease:"power2.in",overwrite:true,onComplete:()=>preview.setAttribute("aria-hidden","true")})}
function wrapScroll(){if(!worldWidth)return;let x=viewport.scrollLeft;while(x<worldWidth){x+=worldWidth}while(x>=worldWidth*2){x-=worldWidth}if(x!==viewport.scrollLeft)viewport.scrollLeft=x}
function stopInertia(){if(inertiaFrame)cancelAnimationFrame(inertiaFrame);inertiaFrame=0}
function runInertia(){stopInertia();let last=performance.now();const tick=now=>{const dt=Math.min(32,now-last);last=now;if(Math.abs(velocity)<.025){velocity=0;inertiaFrame=0;return}viewport.scrollLeft-=velocity*dt;velocity*=Math.pow(.93,dt/16.67);wrapScroll();inertiaFrame=requestAnimationFrame(tick)};inertiaFrame=requestAnimationFrame(tick)}
function entrance(){const intro=$("#intro"),app=$("#app");if(reducedMotion){intro.remove();gsap.set(app,{opacity:1});return}const tl=gsap.timeline({defaults:{ease:"power4.out"}});tl.set(app,{opacity:1}).from(".intro-rule",{scale:.55,rotation:-35,autoAlpha:0,duration:.32,ease:"back.out(1.8)"}).from(".intro img",{scale:1.8,rotation:18,filter:"brightness(3)",autoAlpha:0,duration:.22,ease:"power3.out"},"-=.2").from(".intro-kicker,.intro h1,.intro-subtitle",{y:12,autoAlpha:0,duration:.2,stagger:.035},"-=.1").to(".intro",{autoAlpha:0,scale:1.035,duration:.24,ease:"power2.in",onComplete:()=>intro.remove()},"+=.08").from(".topbar",{y:-8,autoAlpha:0,duration:.18},"-=.12")}
filters.addEventListener("click",e=>{const b=e.target.closest("button[data-tag]");if(!b)return;if(b.dataset.tag==="Wszystko")activeTags.clear();else{if(activeTags.has(b.dataset.tag))activeTags.delete(b.dataset.tag);else activeTags.add(b.dataset.tag)}syncFilterControls();hidePreview();build()});
search.addEventListener("input",()=>{syncFilterControls();hidePreview();build()});
$("#clear-filters").addEventListener("click",()=>{search.value="";activeTags.clear();syncFilterControls();hidePreview();build()});
$("#clear-active-filters").addEventListener("click",()=>{$("#search").value="";activeTags.clear();syncFilterControls();hidePreview();build()});
$("#preview-toggle").addEventListener("click",()=>{previewEnabled=!previewEnabled;const button=$("#preview-toggle");button.setAttribute("aria-pressed",String(previewEnabled));if(!previewEnabled)hidePreview()});
viewport.addEventListener("scroll",wrapScroll,{passive:true});
viewport.addEventListener("wheel",e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();viewport.scrollLeft+=e.deltaY}},{passive:false});
viewport.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;stopInertia();dragging=true;suppressClick=false;lastPointerX=e.clientX;lastMoveTime=performance.now();velocity=0;viewport.classList.add("dragging");viewport.setPointerCapture?.(e.pointerId)});
viewport.addEventListener("pointermove",e=>{if(!dragging)return;const now=performance.now(),dx=e.clientX-lastPointerX,dt=Math.max(1,now-lastMoveTime);viewport.scrollLeft-=dx;velocity=dx/dt;lastPointerX=e.clientX;lastMoveTime=now;if(Math.abs(dx)>3)suppressClick=true;wrapScroll()});
const endDrag=()=>{if(!dragging)return;dragging=false;viewport.classList.remove("dragging");runInertia()};
viewport.addEventListener("pointerup",endDrag);viewport.addEventListener("pointercancel",endDrag);viewport.addEventListener("lostpointercapture",endDrag);
viewport.addEventListener("click",e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;return}if(!e.target.closest(".cell")&&preview.dataset.href)hidePreview()},true);
window.addEventListener("resize",()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(build)});
async function init(){startAtmosphere();const response=await fetch("/core/data/site-pages.json",{cache:"no-cache"});if(!response.ok)throw new Error("Could not load Vengrath page registry");records=(await response.json()).filter(r=>typeof r.url==="string"&&r.url.startsWith("/page/")&&typeof r.title==="string"&&typeof r.image==="string");renderFilters();build();entrance()}
init().catch(error=>{console.error(error);board.textContent="Nie udało się wczytać kolekcji Vengrath.";board.style.color="#ffb4b4";gsap.set($("#app"),{opacity:1});$("#intro")?.remove()});
