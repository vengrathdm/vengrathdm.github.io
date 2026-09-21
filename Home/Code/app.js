(()=>{"use strict";
const viewport=document.getElementById("viewport"),board=document.getElementById("board"),filters=document.getElementById("filters"),search=document.getElementById("search");
let records=[],shuffled=[],activeTag="Wszystko",drag={active:false,startX:0,lastX:0,lastTime:0,velocity:0,moved:false},momentum=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FILTERS=[["Wszystko","Wszystko"],["Aktywna Kampania","Aktywna Kampania"],["Zamknięta Kampania","Zamknięta Kampania"],["Archiwum","Archiwum"],["Blog","Blog"],["Grafika","Grafika"],["Narzędzie","Narzędzie"]];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function path(poly){return poly.map((p,i)=>(i?"L":"M")+p.x.toFixed(2)+" "+p.y.toFixed(2)).join(" ")+" Z"}
function cell(site,sites,b){let p=[{x:b.x0,y:b.y0},{x:b.x1,y:b.y0},{x:b.x1,y:b.y1},{x:b.x0,y:b.y1}];for(const o of sites){if(o===site)continue;const nx=o.x-site.x,ny=o.y-site.y,mid=nx*(o.x+site.x)/2+ny*(o.y+site.y)/2,n=[];for(let i=0;i<p.length;i++){const a=p[i],z=p[(i+1)%p.length],da=nx*a.x+ny*a.y-mid,dz=nx*z.x+ny*z.y-mid,ia=da<=0,iz=dz<=0;if(ia)n.push(a);if(ia!==iz){const t=da/(da-dz);n.push({x:a.x+(z.x-a.x)*t,y:a.y+(z.y-a.y)*t})}}p=n;if(!p.length)break}return p}
function centroid(poly){let x=0,y=0;for(const p of poly){x+=p.x;y+=p.y}return {x:x/poly.length,y:y/poly.length}}
function shape(poly,i,W,H){const c=centroid(poly),seed=(i+1)*97;return poly.map((p,k)=>{const dx=c.x-p.x,dy=c.y-p.y,dist=Math.hypot(dx,dy)||1;let q={x:p.x+dx/dist*7,y:p.y+dy/dist*7};const n1=Math.sin(seed+k*19.17),n2=Math.cos(seed*1.7+k*13.41);if(q.y<14)q.y+=8+Math.abs(n1)*13;if(q.y>H-14)q.y-=8+Math.abs(n2)*13;if(q.x<14)q.x+=6+Math.abs(n2)*10;if(q.x>W-14)q.x-=6+Math.abs(n1)*10;return q})}
function current(){const q=search.value.trim().toLocaleLowerCase("pl");return shuffled.filter(d=>activeTag==="Wszystko"||d.tag===activeTag).filter(d=>!q||d.title.toLocaleLowerCase("pl").includes(q)||d.tag.toLocaleLowerCase("pl").includes(q))}
function pointInPoly(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j],hit=((a.y>y)!=(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x);if(hit)inside=!inside}return inside}
function polygonBounds(poly){return{x:Math.min(...poly.map(p=>p.x)),y:Math.min(...poly.map(p=>p.y)),w:Math.max(...poly.map(p=>p.x))-Math.min(...poly.map(p=>p.x)),h:Math.max(...poly.map(p=>p.y))-Math.min(...poly.map(p=>p.y))}}
function splitTitle(title,ctx,maxW){const words=title.trim().split(/\s+/),lines=[];let line="";for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width<=maxW){line=test}else if(line){lines.push(line);line=word}else{let part="";for(const ch of word){const t=part+ch;if(ctx.measureText(t).width<=maxW)part=t;else{if(part)lines.push(part);part=ch}}line=part}}if(line)lines.push(line);return lines}
function fitText(title,poly,cx,cy){const b=polygonBounds(poly),maxW=b.w*.78,canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");let lo=9,hi=Math.min(30,b.h*.28),best=null;while(hi-lo>.3){const size=(lo+hi)/2;ctx.font='600 '+size+'px "Fira Sans Extra Condensed",sans-serif';const lines=splitTitle(title,ctx,maxW),lh=size*1.02,top=cy-(lines.length-1)*lh/2;let ok=lines.length<=3;for(let i=0;i<lines.length&&ok;i++){const w=ctx.measureText(lines[i]).width,y=top+i*lh+size*.55;const n=Math.max(6,Math.ceil(w/10));for(let j=0;j<=n;j++){const x=cx-w/2+w*j/n;if(!pointInPoly(x,y,poly)||!pointInPoly(x,y-size*.72,poly)){ok=false;break}}}if(ok){best={lines,fontSize:size,lineHeight:lh};lo=size}else hi=size}return best||{lines:[title],fontSize:9,lineHeight:10}}
function addText(g,s,poly){const c=centroid(poly),fit=fitText(s.data.title,poly,c.x,c.y),title=document.createElementNS("http://www.w3.org/2000/svg","text");title.classList.add("shard-title");title.setAttribute("x",c.x);title.setAttribute("y",c.y-(fit.lines.length-1)*fit.lineHeight/2);title.style.fontSize=fit.fontSize+"px";fit.lines.forEach((line,j)=>{const t=document.createElementNS("http://www.w3.org/2000/svg","tspan");t.setAttribute("x",c.x);t.setAttribute("dy",j===0?0:fit.lineHeight);t.textContent=line;title.appendChild(t)});g.appendChild(title);const tag=document.createElementNS("http://www.w3.org/2000/svg","text");tag.classList.add("shard-tag");tag.setAttribute("x",c.x);tag.setAttribute("y",c.y+(fit.lines.length-1)*fit.lineHeight/2+fit.fontSize+14);tag.textContent=s.data.tag;g.appendChild(tag)}
function build(){const H=Math.max(420,viewport.clientHeight||innerHeight-186),W=Math.max(viewport.clientWidth||innerWidth,320),cur=current(),rows=5,tileW=Math.max(210,Math.min(322,W/4.65)),minCols=Math.max(1,Math.ceil(W/tileW)),fallback=cur.length>0&&cur.length<minCols*3;let worldW=W,sites=[];
if(fallback){const cols=Math.max(1,Math.ceil(Math.sqrt(cur.length*1.8))),cw=W/cols,rh=H/Math.max(1,Math.ceil(cur.length/cols));cur.forEach((d,i)=>{const c=i%cols,r=Math.floor(i/cols);sites.push({data:d,x:(c+.5)*cw+(Math.random()-.5)*cw*.3,y:(r+.5)*rh+(Math.random()-.5)*rh*.28})})}
else{let cols=Math.max(minCols,Math.ceil(cur.length/rows));if(cols>1&&(cur.length%rows===1||cur.length%rows===2))cols=Math.max(minCols,cols-1);worldW=Math.max(W,cols*tileW);const counts=Array(cols).fill(Math.floor(cur.length/cols));for(let i=0;i<cur.length%cols;i++)counts[i]++;let k=0;for(let c=0;c<cols;c++){const rh=H/Math.max(1,counts[c]);for(let r=0;r<counts[c];r++){const d=cur[k++];sites.push({data:d,x:(c+.5)*tileW+(Math.random()-.5)*tileW*.42,y:(r+.5)*rh+(Math.random()-.5)*rh*.34})}}}
board.style.width=worldW+"px";board.style.height=H+"px";board.innerHTML="";if(!cur.length)return;
const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("width",worldW);svg.setAttribute("height",H);svg.setAttribute("viewBox",`0 0 ${worldW} ${H}`);svg.classList.add("shatter");const defs=document.createElementNS("http://www.w3.org/2000/svg","defs");svg.appendChild(defs);
sites.forEach((s,i)=>{const raw=cell(s,sites,{x0:0,y0:0,x1:worldW,y1:H});if(raw.length<3)return;const poly=shape(raw,i,worldW,H);const cp=document.createElementNS("http://www.w3.org/2000/svg","clipPath"),id="clip"+i;cp.id=id;const cpPath=document.createElementNS("http://www.w3.org/2000/svg","path");cpPath.setAttribute("d",path(poly));cp.appendChild(cpPath);defs.appendChild(cp);const a=document.createElementNS("http://www.w3.org/2000/svg","a");a.classList.add("shard");a.setAttribute("href",s.data.link);a.setAttribute("aria-label",s.data.title);const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const im=document.createElementNS("http://www.w3.org/2000/svg","image");im.setAttribute("x",minX);im.setAttribute("y",minY);im.setAttribute("width",maxX-minX);im.setAttribute("height",maxY-minY);im.setAttribute("preserveAspectRatio","xMidYMid slice");im.setAttribute("clip-path",`url(#${id})`);im.dataset.src=s.data.graphic;im.classList.add("shard-image");a.appendChild(im);const tint=document.createElementNS("http://www.w3.org/2000/svg","path");tint.setAttribute("d",path(poly));tint.classList.add("shard-tint");a.appendChild(tint);const g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("clip-path",`url(#${id})`);addText(g,s,poly);a.appendChild(g);svg.appendChild(a)});board.appendChild(svg);lazyLoadImages()}
function lazyLoadImages(){const imgs=board.querySelectorAll("image[data-src]");if(!imgs.length)return;const loadImage=im=>{const src=im.dataset.src;if(!src)return;im.setAttribute("href",src);delete im.dataset.src};if(!("IntersectionObserver" in window)){imgs.forEach(loadImage);return}const io=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){loadImage(entry.target);io.unobserve(entry.target)}}},{root:viewport,rootMargin:"500px 900px"});imgs.forEach(im=>io.observe(im))}
async function discoverCards(){
  const cardsPath="Home/Cards/";
  const manifestUrl=new URL(cardsPath+"index.json",document.baseURI).href;

  try{
    const r=await fetch(manifestUrl,{cache:"no-store"});
    if(r.ok){
      const manifest=await r.json();
      if(Array.isArray(manifest) && manifest.length){
        const complete=manifest.every(x=>x &&
          typeof x.name==="string" && /\.txt$/i.test(x.name) &&
          typeof x.title==="string" && typeof x.tag==="string" &&
          typeof x.graphic==="string" && typeof x.link==="string");
        if(complete){
          return manifest.map(x=>({
            name:x.name,
            title:x.title.trim(),
            tag:x.tag.trim(),
            graphic:new URL(x.graphic,manifestUrl).href,
            link:new URL(x.link,manifestUrl).href
          }));
        }
      }
    }
  }catch(error){
    console.warn("Manifest kart jest niedostępny lub nieprawidłowy:",error);
  }

  const api="https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/"+cardsPath+"?ref=main";
  const r=await fetch(api,{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
  if(!r.ok)throw Error("Nie można odczytać listy kart z GitHub API ("+r.status+")");
  const items=await r.json();
  const files=items.filter(x=>x&&x.type==="file"&&/\.txt$/i.test(x.name))
    .map(x=>({name:x.name,url:new URL(x.name,manifestUrl).href}))
    .sort((a,b)=>a.name.localeCompare(b.name,"en",{numeric:true,sensitivity:"base"}));
  if(!files.length)throw Error("Nie można odnaleźć plików TXT w Home/Cards");
  return files;
}

async function parseCard(file){
  if(file.title&&file.tag&&file.graphic&&file.link){
    return {title:file.title,tag:file.tag,graphic:file.graphic,link:file.link};
  }
  const r=await fetch(file.url,{cache:"no-cache"});
  if(!r.ok)throw Error("Home/Cards/"+file.name+" ("+r.status+")");
  const lines=(await r.text()).replace(/^\uFEFF/,"").split(/\r?\n/).map(x=>x.trim());
  if(lines.length<4||!lines[0]||!lines[1]||!lines[2]||!lines[3])throw Error("Nieprawidłowy plik: "+file.name);
  const [title,tag,graphicPath,linkPath]=lines;
  return {title,tag,graphic:new URL(graphicPath,file.url).href,link:new URL(linkPath,file.url).href};
}

async function load(){
  const files=await discoverCards();
  const results=await Promise.allSettled(files.map(parseCard));
  const good=[],failed=[];
  results.forEach((result,i)=>result.status==="fulfilled"?good.push(result.value):failed.push({file:files[i].name,error:result.reason}));
  if(failed.length)console.warn("Pominięto nieprawidłowe karty:",failed);
  if(!good.length)throw Error("Nie udało się wczytać żadnej prawidłowej karty");
  records=good;
  shuffled=shuffle([...records]);
  build();
}

function setup(){filters.innerHTML="";FILTERS.forEach(([label,tag],i)=>{const b=document.createElement("button");b.className="filter"+(i===0?" active":"");b.dataset.tag=tag;b.textContent=label;filters.appendChild(b)});filters.onclick=e=>{const b=e.target.closest(".filter");if(!b)return;activeTag=b.dataset.tag;filters.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));build()};search.addEventListener("input",build)}
viewport.addEventListener("wheel",e=>{const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(d){e.preventDefault();viewport.scrollLeft+=d*2.5}},{passive:false});
let resizeFrame=0,suppressClickUntil=0;
viewport.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0)return;cancelAnimationFrame(momentum);drag={active:true,startX:e.clientX,lastX:e.clientX,lastTime:performance.now(),velocity:0,moved:false,target:e.target.closest?e.target.closest(".shard"):null};viewport.style.cursor="grabbing";viewport.setPointerCapture(e.pointerId)});
viewport.addEventListener("pointermove",e=>{if(!drag.active)return;const now=performance.now(),dx=e.clientX-drag.lastX,dt=Math.max(1,now-drag.lastTime);viewport.scrollLeft-=dx;drag.velocity=(-dx/dt)*16;if(Math.abs(e.clientX-drag.startX)>8)drag.moved=true;drag.lastX=e.clientX;drag.lastTime=now});
function release(e){if(!drag.active)return;const moved=drag.moved;const target=drag.target;const link=target&&target.getAttribute("href");drag.active=false;viewport.style.cursor="grab";try{viewport.releasePointerCapture(e.pointerId)}catch(_){}let v=drag.velocity;const tick=()=>{viewport.scrollLeft+=v;v*=.94;if(Math.abs(v)>.15)momentum=requestAnimationFrame(tick)};if(Math.abs(v)>.15)momentum=requestAnimationFrame(tick);if(!moved&&link){suppressClickUntil=Date.now()+350;window.location.assign(link)}else if(moved){suppressClickUntil=Date.now()+350}setTimeout(()=>drag.moved=false,100)}
viewport.addEventListener("pointerup",release);viewport.addEventListener("pointercancel",release);
viewport.addEventListener("click",e=>{if(Date.now()<suppressClickUntil&&e.target.closest?.(".shard")){e.preventDefault();e.stopPropagation()}},true);
addEventListener("resize",()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(build)});setup();load().catch(e=>{console.error(e);board.innerHTML='<div class="load-error">Nie udało się wczytać kart. Sprawdź, czy pliki TXT znajdują się w Home/Cards/.</div>'});
})();
