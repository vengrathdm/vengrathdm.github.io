const DATA_URL="./data/relationships.json";
const TYPES={Person:{glyph:"♙",shape:"ellipse",fields:["Aliases","Occupation","Age","Status","Affiliation"]},Family:{glyph:"⚜",shape:"hexagon",fields:["Seat / estate","Motto"]},Faction:{glyph:"⚑",shape:"diamond",fields:["Purpose","Headquarters","Leader"]},Object:{glyph:"✧",shape:"star",fields:["Object type","Custodian"]},Event:{glyph:"◷",shape:"triangle",fields:["Date / period","Venue"]},Institution:{glyph:"♜",shape:"rectangle",fields:["Institution type","Jurisdiction","Authority"]},Location:{glyph:"⌂",shape:"round-rectangle",fields:["Location type","Area"]}};
const ENTITY_DEFAULT_COLORS={Person:"#68468f",Family:"#5b3d66",Faction:"#453452",Object:"#8f7040",Event:"#68468f",Institution:"#453452",Location:"#3d514d"};
const ENTITY_DEFAULT_BORDER="#d8bb63";
let TYPE_NAMES=Object.keys(TYPES);
const PL_TYPES={Person:"Postać",Family:"Rodzina",Faction:"Stronnictwo",Object:"Przedmiot",Event:"Wydarzenie",Institution:"Instytucja",Location:"Lokalizacja"};
const PL_FIELDS={Aliases:"Pseudonimy",Occupation:"Zawód",Age:"Wiek",Status:"Status",Affiliation:"Przynależność","Seat / estate":"Siedziba / posiadłość",Motto:"Motto",Purpose:"Cel",Headquarters:"Siedziba",Leader:"Przywódca","Object type":"Rodzaj przedmiotu",Custodian:"Opiekun","Date / period":"Data / okres",Venue:"Miejsce","Institution type":"Rodzaj instytucji",Jurisdiction:"Jurysdykcja",Authority:"Władza","Location type":"Rodzaj lokalizacji",Area:"Obszar",Feature:"Cechy",Goal:"Cel"};
const plType=v=>PL_TYPES[v]||v,plField=v=>PL_FIELDS[v]||v,plDirection=v=>({none:"brak",towards:"do",from:"od",mutual:"dwukierunkowo"}[v]||v),plLine=v=>({solid:"ciągła",dotted:"kropkowana",dashed:"przerywana"}[v]||v);
const plRelType=v=>({ALLY_OF:"Sojusznik",CAPTURED_BY:"Pojmany przez",SERVES:"Służy",SEEKS:"Poszukuje",DISCOVERED:"Odkrywa"}[v]||v);
const $=id=>document.getElementById(id),uid=p=>p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),clone=x=>JSON.parse(JSON.stringify(x));
const BUILTIN_TYPES=clone(TYPES);
let officialData,data,dirty=false,selected=null,activeTab="view",activeView="complete",layoutModes={complete:"force",family:"hierarchy",organization:"hierarchy",political:"force",characters:"force"},wizard=null,confirmAction=null,viewports={complete:null,family:null,organization:null,political:null,characters:null},toastTimer;
let cy,labelStage=3,pendingPlacement=null,entityLabelPosition="below",relationshipLabelPosition="above",entityLabelMode="always",relationshipLabelMode="always";
const graphSurface=$("graph");
document.querySelector("#controlWindow .tabs")?.addEventListener("click",e=>{
 const button=e.target.closest(".tab[data-tab]");
 if(!button)return;
 e.preventDefault();e.stopPropagation();openTab(button.dataset.tab);
},true);
graphSurface?.addEventListener("contextmenu",e=>{
 if(!graphSurface.contains(e.target)||!cy)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const rect=graphSurface.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
 const hit=graphElementAt(x,y),menuPosition={x:e.clientX,y:e.clientY};
 if(hit?.isNode())entityMenu(entity(hit.id()),menuPosition);
 else if(hit?.isEdge())relationMenu(rel(hit.id()),menuPosition);
 else entitySubmenu({...menuPosition,graphPosition:{x:(x-cy.pan().x)/cy.zoom(),y:(y-cy.pan().y)/cy.zoom()}});
},true);
const STORAGE_KEY="dragonsDue.relationshipMap.v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isImageUrl=value=>{if(/^data:image\/(png|webp);base64,/i.test(value))return true;try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&/\.(png|webp)$/i.test(u.pathname)}catch(_){return false}};
function md(source){
 const inline=value=>value.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/\x60([^\x60]+)\x60/g,"<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^ )]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
 const lines=esc(source||"").split(/\r?\n/);let html="",inList=false;
 for(const raw of lines){const line=raw.trim();if(/^[-*] /.test(line)){if(!inList){html+="<ul>";inList=true}html+="<li>"+inline(line.slice(2))+"</li>";continue}
  if(inList){html+="</ul>";inList=false}if(!line){continue}
  if(/^### /.test(line))html+="<h4>"+inline(line.slice(4))+"</h4>";
  else if(/^## /.test(line))html+="<h3>"+inline(line.slice(3))+"</h3>";
  else if(/^# /.test(line))html+="<h2>"+inline(line.slice(2))+"</h2>";
  else html+="<p>"+inline(line)+"</p>";
 }
 if(inList)html+="</ul>";return html;
}
const entity=id=>data.entities.find(x=>x.id===id),rel=id=>data.relationships.find(x=>x.id===id);
function toast(s){$("toast").textContent=s;$("toast").classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("visible"),2800)}
function setDirty(v){dirty=v;const status=$("dirtyState");if(status){status.textContent=v?"Kopia robocza zmieniona · oczekiwanie na zapis lokalny":"Wczytano dane oficjalne · brak niezapisanych zmian";status.style.color=v?"#efc27a":"#b7ad98"}}
let saveTimer;
function openLocalDb(){return new Promise((resolve,reject)=>{if(!("indexedDB" in window)){reject(Error("IndexedDB jest niedostępne"));return}const request=indexedDB.open("DragonsDueRelationshipMap",1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("state"))request.result.createObjectStore("state",{keyPath:"id"})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function persistLocal(){
 clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{
  try{const db=await openLocalDb();await new Promise((resolve,reject)=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").put({id:"working",data});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();if($("persistenceState")){$("persistenceState").textContent="Zapis lokalny · dane zapisane w tej przeglądarce";$("persistenceState").style.color="#b7c89c"}}
  catch(err){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if($("persistenceState")){$("persistenceState").textContent="Zapis lokalny · dane zapisane w tej przeglądarce";$("persistenceState").style.color="#b7c89c"}}catch(_){if($("persistenceState")){$("persistenceState").textContent="Zapis lokalny niedostępny · wyeksportuj kopię zapasową";$("persistenceState").style.color="#efc27a"}}}
 },180);
}
async function restoreLocal(){
 try{const db=await openLocalDb();const saved=await new Promise((resolve,reject)=>{const req=db.transaction("state","readonly").objectStore("state").get("working");req.onsuccess=()=>resolve(req.result?.data||null);req.onerror=()=>reject(req.error)});db.close();if(saved){data=normalize(saved);setDirty(true);if($("persistenceState"))$("persistenceState").textContent="Przywrócono lokalną kopię roboczą";return true}}
 catch(_){}
 try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;data=normalize(JSON.parse(raw));setDirty(true);if($("persistenceState"))$("persistenceState").textContent="Przywrócono lokalną kopię roboczą";return true}
 catch(err){if($("persistenceState"))$("persistenceState").textContent="Nie udało się odczytać zapisanej kopii lokalnej";return false}
}
async function clearLocal(){try{const db=await openLocalDb();await new Promise(resolve=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").delete("working");tx.oncomplete=resolve;tx.onerror=resolve});db.close()}catch(_){}localStorage.removeItem(STORAGE_KEY)}
function applyEntityTypes(metadata){
 Object.keys(TYPES).forEach(k=>delete TYPES[k]);Object.assign(TYPES,clone(BUILTIN_TYPES));
 (Array.isArray(metadata?.entityTypes)?metadata.entityTypes:[]).forEach(def=>{
  if(!def||typeof def.name!=="string"||!/^[\p{L}\p{N} _-]{2,32}$/u.test(def.name)||TYPES[def.name]||!["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(def.shape)||typeof def.glyph!=="string"||!def.glyph.trim())return;
  TYPES[def.name]={glyph:def.glyph.slice(0,4),shape:def.shape,fields:Array.isArray(def.fields)?def.fields.filter(x=>typeof x==="string").slice(0,12):[]};
 });
 Object.entries(metadata?.entityTypeOverrides||{}).forEach(([name,def])=>{if(TYPES[name]&&def&&["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(def.shape))TYPES[name]={...TYPES[name],glyph:String(def.glyph||TYPES[name].glyph).slice(0,4),shape:def.shape,fields:Array.isArray(def.fields)?def.fields.filter(x=>typeof x==="string").slice(0,12):TYPES[name].fields}});
 TYPE_NAMES=Object.keys(TYPES);
}
function normalize(source){
 if(!source||typeof source!=="object"||source.schemaVersion!==1||!Array.isArray(source.entities)||!Array.isArray(source.relationships))throw Error("Oczekiwano schemaVersion 1 oraz tablic obiektów i relacji.");
 const metadata=source.metadata&&typeof source.metadata==="object"?source.metadata:{id:"dragons-due-relationships",name:"The Dragon's Due — Mapa relacji"};
 applyEntityTypes(metadata);
 metadata.relationshipTypes=(Array.isArray(metadata.relationshipTypes)?metadata.relationshipTypes:[]).filter(t=>t&&typeof t.name==="string"&&t.name.trim()).map(t=>({name:t.name.trim().slice(0,80),description:typeof t.description==="string"?t.description:"",color:/^#[0-9a-f]{6}$/i.test(t.color||"")?t.color:"#d8bb63",lineStyle:["solid","dotted","dashed"].includes(t.lineStyle)?t.lineStyle:"solid",direction:["none","towards","from","mutual"].includes(t.direction)?t.direction:"none"}));
 const validViews=new Set(["complete","family","organization","political","characters"]);
 metadata.savedViews=(Array.isArray(metadata.savedViews)?metadata.savedViews:[]).filter(v=>v&&typeof v.name==="string"&&v.name.trim()).map(v=>({name:v.name.trim().slice(0,80),activeView:validViews.has(v.activeView)?v.activeView:"complete",layout:["force","hierarchy","manual"].includes(v.layout)?v.layout:"force",zoom:Number.isFinite(v.zoom)?Math.max(.12,Math.min(3,v.zoom)):1,pan:v.pan&&Number.isFinite(v.pan.x)&&Number.isFinite(v.pan.y)?{x:v.pan.x,y:v.pan.y}:{x:0,y:0},entityTypes:Array.isArray(v.entityTypes)?v.entityTypes.filter(x=>typeof x==="string"):TYPE_NAMES,relationshipTypes:Array.isArray(v.relationshipTypes)?v.relationshipTypes.filter(x=>typeof x==="string"):[],selectedEntityId:typeof v.selectedEntityId==="string"?v.selectedEntityId:null,showEntityLabels:v.showEntityLabels!==false,showRelationshipLabels:v.showRelationshipLabels!==false,labelStage:[2,3,4].includes(v.labelStage)?v.labelStage:3}));
 metadata.layoutModes=metadata.layoutModes&&typeof metadata.layoutModes==="object"?Object.fromEntries(Object.entries(metadata.layoutModes).filter(([k,v])=>validViews.has(k)&&["force","hierarchy","manual"].includes(v))):{};

 const ids=new Set();
 const entities=source.entities.map(e=>{
  if(!e||typeof e.id!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(e.id)||typeof e.name!=="string"||!e.name.trim()||!TYPES[e.type]||ids.has(e.id))throw Error("Obiekt ma nieprawidłowy identyfikator, nazwę lub typ.");
  ids.add(e.id);if(e.imageUrl&&!isImageUrl(e.imageUrl))throw Error("Grafika obiektu musi być plikiem PNG lub WEBP, adresem HTTPS/HTTP albo osadzonym przesłanym plikiem.");
  return{id:e.id,type:e.type,name:e.name.trim(),imageUrl:e.imageUrl||"",color:/^#[0-9a-f]{6}$/i.test(e.color||"")?e.color:(ENTITY_DEFAULT_COLORS[e.type]||"#453452"),borderColor:/^#[0-9a-f]{6}$/i.test(e.borderColor||"")?e.borderColor:ENTITY_DEFAULT_BORDER,lineStyle:["solid","dotted","dashed"].includes(e.lineStyle)?e.lineStyle:"solid",notes:typeof e.notes==="string"?e.notes:"",fields:e.fields&&typeof e.fields==="object"?e.fields:{},customFields:Array.isArray(e.customFields)?e.customFields.filter(x=>x&&typeof x.key==="string").map(x=>({key:x.key,type:["text","number","date","select","checkbox","entity"].includes(x.type)?x.type:"text",options:typeof x.options==="string"?x.options:""})):[],positions:e.positions&&typeof e.positions==="object"?e.positions:{},position:e.position||null};
 });
 const relationshipIds=new Set();
 const relationships=source.relationships.map(r=>{
  if(!r||typeof r.id!=="string"||!/^[A-Za-z0-9_-]{1,128}$/.test(r.id)||relationshipIds.has(r.id)||!ids.has(r.source)||!ids.has(r.target)||r.source===r.target||typeof r.type!=="string"||!r.type.trim())throw Error("Relacja ma nieprawidłowy identyfikator, typ lub punkt końcowy.");
  relationshipIds.add(r.id);
  if(!["none","towards","from","mutual"].includes(r.direction||"none")||!["solid","dotted","dashed"].includes(r.lineStyle||"solid")||!/^#[0-9a-f]{6}$/i.test(r.color||"#d8bb63"))throw Error("Nieprawidłowy styl relacji.");
  return{id:r.id,source:r.source,target:r.target,type:r.type.trim(),note:typeof r.note==="string"?r.note:"",color:r.color||"#d8bb63",lineStyle:r.lineStyle||"solid",direction:r.direction||"none"};
 });
 return{schemaVersion:1,metadata,entities,relationships};
}
async function fetchOfficial(){const r=await fetch(DATA_URL,{cache:"no-store"});if(!r.ok)throw Error("Nie udało się wczytać danych oficjalnych ("+r.status+").");return normalize(await r.json())}
function openTab(tab){if(!["view","editor"].includes(tab))return;activeTab=tab;document.querySelectorAll("#controlWindow .tab[data-tab]").forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active))});["view","editor"].forEach(k=>{const panel=$(k+"Panel");if(panel)panel.hidden=k!==tab})}
function openDialog(id){$("modalShade").hidden=false;$(id).hidden=false;hideContext()}
function closeDialogs(){["entityDialog","relationshipDialog","confirmDialog"].forEach(id=>$(id).hidden=true);$("modalShade").hidden=true;wizard=null}
document.querySelectorAll("[data-close-dialog]").forEach(b=>b.onclick=closeDialogs);$("modalShade").onclick=()=>{if($("confirmDialog").hidden)closeDialogs()};
function updateCount(){const el=$("graphCount");if(el)el.textContent=data.entities.length+" obiektów · "+data.relationships.length+" relacji"}
function updateEntityReferenceOptions(){const dl=$("entityReferenceOptions");if(dl)dl.innerHTML=data.entities.map(e=>'<option value="'+esc(e.name)+'">').join("")}
function markDirty(){setDirty(true);persistLocal();renderGraph();renderFilters();renderLegend();updateCount();updateEntityReferenceOptions()}
function nodeElements(es,rs){
 const counts=new Map();rs.forEach(r=>{const key=[r.source,r.target].sort().join("|");counts.set(key,(counts.get(key)||0)+1)});
 const nodes=es.map((e,i)=>({data:{id:e.id,name:e.name,label:TYPES[e.type].glyph+" "+e.name,type:e.type,glyph:TYPES[e.type].glyph,shape:TYPES[e.type].shape,image:e.imageUrl||"",entityColor:e.color||(ENTITY_DEFAULT_COLORS[e.type]||"#453452"),entityBorderColor:e.borderColor||ENTITY_DEFAULT_BORDER,entityLineStyle:e.lineStyle||"solid",fields:e.fields,notes:e.notes},position:e.positions?.[activeView]||e.position||{x:(i%5)*160-320,y:Math.floor(i/5)*135-180}}));
 const edges=rs.map(r=>({data:{id:r.id,source:r.source,target:r.target,type:r.type,label:plRelType(r.type),note:r.note,color:r.color,lineStyle:r.lineStyle,direction:r.direction,curveStyle:counts.get([r.source,r.target].sort().join("|"))>1?"bezier":"straight"}}));
 return nodes.concat(edges)
}
function viewData(){
 if(activeView==="complete")return{entities:data.entities,relationships:data.relationships};
 if(activeView==="political"){
  const allowed=new Set(["Family","Faction","Institution","Location"]);
  const entities=data.entities.filter(e=>allowed.has(e.type)),ids=new Set(entities.map(e=>e.id));
  return{entities,relationships:data.relationships.filter(r=>ids.has(r.source)&&ids.has(r.target))};
 }
 if(activeView==="characters"){
  const entities=data.entities.filter(e=>e.type==="Person"),ids=new Set(entities.map(e=>e.id));
  return{entities,relationships:data.relationships.filter(r=>ids.has(r.source)&&ids.has(r.target))};
 }
 const type=activeView==="family"?"Family":"Faction",root=selected?.kind==="entity"?entity(selected.id):null,chosen=root?.type===type?root:data.entities.find(e=>e.type===type);
 if(!chosen)return{entities:[],relationships:[]};
 const ids=new Set([chosen.id]);let changed=true;while(changed){changed=false;data.relationships.forEach(r=>{if(ids.has(r.source)&&!ids.has(r.target)){ids.add(r.target);changed=true}if(ids.has(r.target)&&!ids.has(r.source)){ids.add(r.source);changed=true}})}
 return{entities:data.entities.filter(e=>ids.has(e.id)),relationships:data.relationships.filter(r=>ids.has(r.source)&&ids.has(r.target)),root:chosen};
}
function capture(){if(cy&&cy.elements().length)viewports[activeView]={zoom:cy.zoom(),pan:clone(cy.pan())}}
const MIN_AUTOGENERATED_ENTITY_DISTANCE=126;
function enforceMinimumEntitySpacing(){
 const nodes=cy.nodes();
 for(let pass=0;pass<160;pass++){
  let adjusted=false;
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],pa=a.position(),pb=b.position();
   let dx=pb.x-pa.x,dy=pb.y-pa.y,distance=Math.hypot(dx,dy);
   if(distance>=MIN_AUTOGENERATED_ENTITY_DISTANCE)continue;
   if(distance<0.001){const angle=((i+1)*37+(j+1)*19)*Math.PI/180;dx=Math.cos(angle);dy=Math.sin(angle);distance=1}
   const push=(MIN_AUTOGENERATED_ENTITY_DISTANCE-distance)/2;
   const ux=dx/distance,uy=dy/distance;
   a.position({x:pa.x-ux*push,y:pa.y-uy*push});
   b.position({x:pb.x+ux*push,y:pb.y+uy*push});
   adjusted=true;
  }
  if(!adjusted)break;
 }
}
const FORCE_LAYOUT_SPREAD=1.9;
function spreadForceLayout(){
 const nodes=cy.nodes();if(nodes.length<2)return;
 let centerX=0,centerY=0;
 nodes.forEach(node=>{const p=node.position();centerX+=p.x;centerY+=p.y});
 centerX/=nodes.length;centerY/=nodes.length;
 nodes.forEach(node=>{const p=node.position();node.position({x:centerX+(p.x-centerX)*FORCE_LAYOUT_SPREAD,y:centerY+(p.y-centerY)*FORCE_LAYOUT_SPREAD})});
}
function layout(mode,fit=true){
 layoutModes[activeView]=mode;data.metadata.layoutModes={...(data.metadata.layoutModes||{}),[activeView]:mode};
 const pairCounts=new Map(),degree=new Map();
 cy.edges().forEach(edge=>{const a=edge.data("source"),b=edge.data("target"),key=[a,b].sort().join("|");pairCounts.set(key,(pairCounts.get(key)||0)+1);degree.set(a,(degree.get(a)||0)+1);degree.set(b,(degree.get(b)||0)+1)});
 const opts=mode==="hierarchy"?{name:"breadthfirst",directed:true,spacingFactor:1.3,padding:55,animate:false,roots:cy.nodes().filter(n=>n.data("type")===(activeView==="family"?"Family":"Faction"))}:mode==="manual"?{name:"preset",fit:false}:{name:"cose",animate:false,randomize:false,numIter:1800,idealEdgeLength:edge=>{const count=pairCounts.get([edge.data("source"),edge.data("target")].sort().join("|"))||1;return Math.max(88,205-(count-1)*32)},edgeElasticity:edge=>{const count=pairCounts.get([edge.data("source"),edge.data("target")].sort().join("|"))||1;return Math.min(260,105+(count-1)*55)},nodeRepulsion:node=>18000+Math.min(degree.get(node.id())||0,8)*1500,gravity:.09,componentSpacing:110,fit};
 cy.layout(opts).run();if(mode==="force"){enforceMinimumEntitySpacing();spreadForceLayout()}const label=$("activeViewLabel");if(label)label.textContent=(activeView==="complete"?"Pełny graf":activeView==="family"?"Drzewo rodziny":activeView==="organization"?"Graf organizacji":activeView==="political"?"Sieć polityczna":"Sieć postaci")+" · "+(mode==="hierarchy"?"Hierarchiczny":mode==="manual"?"Ręczny":"Siłowy");if(fit&&mode!=="manual")cy.fit(cy.elements(),55)
}
function renderGraph(){
 if(!cy)return;const v=viewData();cy.elements().remove();cy.add(nodeElements(v.entities,v.relationships));
 cy.nodes().forEach(n=>{if(entity(n.id())?.imageUrl)n.addClass("has-image")});
 cy.style().selector("node").style({width:68,height:68,shape:"data(shape)","background-color":"data(entityColor)","border-width":2,"border-style":"data(entityLineStyle)","border-color":"data(entityBorderColor)",label:"data(label)",color:"#f1e6d0","font-family":"Voltaire","font-size":13,"text-valign":"center","text-halign":"center","text-wrap":"wrap","text-max-width":76,"text-outline-color":"#17252b","text-outline-width":2})
 .selector("node.has-image").style({"background-image":"data(image)","background-fit":"cover","background-clip":"node",label:"data(label)",color:"#f1e6d0","font-size":11,"text-background-color":"#17252b","text-background-opacity":.78,"text-background-padding":2})
 .selector("edge").style({width:2,"line-color":"data(color)","target-arrow-color":"data(color)","source-arrow-color":"data(color)","curve-style":"straight",label:"data(label)","font-family":"Courier Prime","font-size":10,"font-weight":"bold",color:"#f3ead7","text-background-color":"#17252b","text-background-opacity":.9,"text-background-padding":3,"text-rotation":"autorotate","text-margin-y":-8,"line-style":"solid","target-arrow-shape":"none","source-arrow-shape":"none"})
 .selector('edge[curveStyle="bezier"]').style({"curve-style":"bezier"}).selector('edge[lineStyle="dashed"]').style({"line-style":"dashed"}).selector('edge[lineStyle="dotted"]').style({"line-style":"dotted"})
 .selector('edge[direction="towards"]').style({"target-arrow-shape":"triangle"}).selector('edge[direction="from"]').style({"source-arrow-shape":"triangle"}).selector('edge[direction="mutual"]').style({"target-arrow-shape":"triangle","source-arrow-shape":"triangle"})
 .selector(".placement-preview").style({opacity:.62,"border-style":"dashed","border-color":"#f0d59a","background-opacity":.45,"events":"no"}).selector(".dimmed").style({opacity:.13}).selector(".selected").style({opacity:1,"border-width":4}).update();
 applyLabelStyles();
 layout(layoutModes[activeView]||(["complete","political","characters"].includes(activeView)?"force":"hierarchy"),false);if(viewports[activeView])cy.viewport(viewports[activeView]);else if(cy.elements().length)cy.fit(cy.elements(),55);
 if(selected){const el=cy.getElementById(selected.id);if(el.length){el.addClass("selected");if(selected.kind==="entity")el.closedNeighborhood().addClass("adjacent")}}
 updateCount();renderDossier();applyFilters();
}
function clearSelection(){selected=null;cy.elements().removeClass("selected adjacent dimmed");renderDossier()}
function setSelection(kind,id){selected={kind,id};$("dossierWindow").hidden=false;cy.elements().removeClass("selected adjacent dimmed");const el=cy.getElementById(id);if(el.length){el.addClass("selected");const neighborhood=el.closedNeighborhood();neighborhood.addClass("adjacent");cy.elements().not(neighborhood).addClass("dimmed")}renderDossier()}
function renderFilters(){
  const oldEntityShowAll=$("entityShowAll")?.checked??true,oldRelationshipShowAll=$("relationshipShowAll")?.checked??true;
  const oldEntities=new Map([...$("entityFilters").querySelectorAll("input")].map(i=>[i.dataset.entityFilter,i.checked]));
  const oldRelations=new Map([...$("relationshipFilters").querySelectorAll("input")].map(i=>[i.dataset.relFilter,i.checked]));
  $("entityFilters").innerHTML='<div class="filter-heading-row"><h3>Typy obiektów</h3><label class="check-row filter-all"><input id="entityShowAll" type="checkbox" '+(oldEntityShowAll?"checked":"")+'> Pokaż wszystkie</label></div><div class="filter-options">'+TYPE_NAMES.map(t=>'<label class="check-row"><input type="checkbox" data-entity-filter="'+t+'" '+(oldEntities.get(t)===false?"":"checked")+'> '+plType(t)+"</label>").join("")+'</div>';
  const types=[...new Set(data.relationships.map(r=>r.type))].sort();
  $("relationshipFilters").innerHTML='<div class="filter-heading-row"><h3>Typy relacji</h3><label class="check-row filter-all"><input id="relationshipShowAll" type="checkbox" '+(oldRelationshipShowAll?"checked":"")+'> Pokaż wszystkie</label></div><div class="filter-options">'+(types.length?types.map(t=>'<label class="check-row"><input type="checkbox" data-rel-filter="'+esc(t)+'" '+(oldRelations.get(t)===false?"":"checked")+'> '+esc(plRelType(t))+"</label>").join(""):'<span class="muted">Brak typów relacji.</span>')+'</div>';
  document.querySelectorAll("[data-entity-filter],[data-rel-filter],#entityShowAll,#relationshipShowAll").forEach(i=>i.onchange=applyFilters);applyFilters()
 }
 function applyFilters(){if(!cy)return;const showAllEntities=$("entityShowAll")?.checked??true,showAllRelationships=$("relationshipShowAll")?.checked??true;const ets=showAllEntities?TYPE_NAMES:[...document.querySelectorAll("[data-entity-filter]:checked")].map(i=>i.dataset.entityFilter),rts=showAllRelationships?[...new Set(data.relationships.map(r=>r.type))]:[...document.querySelectorAll("[data-rel-filter]:checked")].map(i=>i.dataset.relFilter);document.querySelectorAll("[data-entity-filter]").forEach(i=>i.disabled=showAllEntities);document.querySelectorAll("[data-rel-filter]").forEach(i=>i.disabled=showAllRelationships);cy.nodes().forEach(n=>n.style("display",ets.includes(n.data("type"))?"element":"none"));cy.edges().forEach(e=>e.style("display",rts.includes(e.data("type"))&&ets.includes(e.source().data("type"))&&ets.includes(e.target().data("type"))?"element":"none"))}
function renderLegend(){$("legendContent").innerHTML='<div class="legend-section"><h3>Typy obiektów</h3>'+TYPE_NAMES.map(t=>'<div class="legend-row"><span class="legend-icon">'+esc(TYPES[t].glyph)+'</span>'+esc(plType(t))+"</div>").join("")+'</div><div class="legend-section"><h3>Typy relacji i kolory</h3>'+[...new Map([...(data.metadata.relationshipTypes||[]).map(r=>({type:r.name,color:r.color})),...data.relationships.map(r=>({type:r.type,color:r.color}))].map(r=>[r.type+"|"+r.color,r])).values()].map(({type,color})=>'<div class="legend-row"><span style="width:12px;height:12px;border-radius:50%;background:'+esc(color)+'"></span>'+esc(plRelType(type))+"</div>").join("")+'</div><div class="legend-section"><h3>Style linii</h3><div class="legend-row"><span class="legend-line"></span> Ciągła</div><div class="legend-row"><span class="legend-line dashed"></span> Przerywana</div><div class="legend-row"><span class="legend-line dotted"></span> Kropkowana</div><div class="legend-row">Kierunki strzałek: brak · do · od · dwukierunkowo</div></div>'}
function renderDossier(){
 const hosts=[$("dossierContent")].filter(Boolean);
 let markup="";
 if(!selected)markup='<div class="empty-dossier"><span class="empty-mark">✧</span><p>Wybierz obiekt lub relację, aby wyświetlić kartę rekordu.</p></div>';
 else if(selected.kind==="entity"){
  const e=entity(selected.id);if(!e){selected=null;renderDossier();return}
  const fields=Object.entries(e.fields||{}).filter(([,v])=>String(v).trim());
  markup='<div class="dossier-type">'+plType(e.type)+'</div><h3 class="dossier-name">'+esc(e.name)+'</h3>'+(e.imageUrl?'<img class="dossier-image" src="'+esc(e.imageUrl)+'" alt="">':"")+(fields.length?'<dl class="dossier-fields">'+fields.map(([k,v])=>"<dt>"+esc(plField(k))+"</dt><dd>"+esc(v)+"</dd>").join("")+"</dl>":"")+'<div class="dossier-notes">'+(e.notes?md(e.notes):'<span class="muted">Brak zapisanych notatek.</span>')+'</div><div class="dossier-actions"><button data-dossier-action="edit" class="subtle-button">Edytuj</button><button data-dossier-action="delete" class="danger-button">Usuń</button></div>';
  hosts.forEach(host=>{host.innerHTML=markup;host.querySelector('[data-dossier-action="edit"]').onclick=()=>openEntityDialog(e.type,e);host.querySelector('[data-dossier-action="delete"]').onclick=()=>deleteEntity(e)});
  return;
 }else{
  const r=rel(selected.id);if(!r){selected=null;renderDossier();return}
  markup='<div class="dossier-type">RELACJA · '+plDirection(r.direction)+'</div><h3 class="dossier-name">'+esc(entity(r.source)?.name||"?")+" ↔ "+esc(entity(r.target)?.name||"?")+'</h3><dl class="dossier-fields"><dt>Typ</dt><dd>'+esc(plRelType(r.type))+'</dd><dt>Znaczenie</dt><dd>'+esc(relationshipTypePreset(r.type)?.description||"—")+'</dd><dt>Kolor</dt><dd>'+esc(r.color)+'</dd><dt>Linia</dt><dd>'+esc(plLine(r.lineStyle))+'</dd><dt>Kierunek</dt><dd>'+esc(plDirection(r.direction))+'</dd></dl><div class="dossier-notes">'+(r.note?md(r.note):'<span class="muted">Brak zapisanej notatki.</span>')+'</div><div class="dossier-actions"><button data-dossier-action="edit" class="subtle-button">Edytuj</button><button data-dossier-action="delete" class="danger-button">Usuń</button></div>';
  hosts.forEach(host=>{host.innerHTML=markup;host.querySelector('[data-dossier-action="edit"]').onclick=()=>startRelationshipWizard(r);host.querySelector('[data-dossier-action="delete"]').onclick=()=>deleteRelationship(r)});
  return;
 }
 hosts.forEach(host=>host.innerHTML=markup);
}
function focusEntity(id){const n=cy.getElementById(id);if(n.length)cy.animate({center:{eles:n},zoom:Math.max(cy.zoom(),1.15)},{duration:300})}
function openEntityDialog(type,e=null){
 $("entityDialog").dataset.position="";$("entityImageFile").value="";$("imagePreview").hidden=true;$("notesPreview").hidden=false;$("entityDialogTitle").textContent=(e?"Edytuj ":"Utwórz ")+plType(type);$("entityType").innerHTML=TYPE_NAMES.map(t=>'<option value="'+t+'">'+({Person:"Postać",Family:"Rodzina",Faction:"Stronnictwo",Object:"Przedmiot",Event:"Wydarzenie",Institution:"Instytucja",Location:"Lokalizacja"}[t]||t)+"</option>").join("");$("entityType").value=type;$("entityType").disabled=!!e;$("entityName").value=e?.name||"";$("entityImage").value=e?.imageUrl||"";$("entityColor").value=e?.color||(ENTITY_DEFAULT_COLORS[type]||"#453452");$("entityBorderColor").value=e?.borderColor||ENTITY_DEFAULT_BORDER;$("entityLineStyle").value=e?.lineStyle||"solid";$("entityNotes").value=e?.notes||"";$("notesPreview").innerHTML=md($("entityNotes").value);if(e?.imageUrl){$("imagePreview").innerHTML='<img src="'+esc(e.imageUrl)+'" alt="Podgląd obrazu">';$("imagePreview").hidden=false}
 $("entitySpecificFields").innerHTML='<div class="dialog-field-grid">'+TYPES[type].fields.map(label=>{const key=label.toLowerCase().replace(/[^a-z]+/g,"_");return'<label>'+esc(plField(label))+'<input data-field="'+key+'" value="'+esc(e?.fields?.[key]||"")+'"></label>'}).join("")+"</div>";
 $("customFields").innerHTML="";(e?.customFields||[]).forEach(def=>addCustomField(def.key,e?.fields?.[def.key]??"",def.type||"text",def.options||""));const knownCustom=new Set((e?.customFields||[]).map(x=>x.key));Object.entries(e?.fields||{}).filter(([k])=>!knownCustom.has(k)&&!TYPES[type].fields.some(label=>label.toLowerCase().replace(/[^a-z]+/g,"_")===k)).forEach(([k,v])=>addCustomField(k,v,"text"));
 $("entityForm").dataset.editId=e?.id||"";openDialog("entityDialog")
}
$("entityNotes").addEventListener("input",()=>{$("notesPreview").innerHTML=md($("entityNotes").value)});
document.querySelectorAll("[data-md]").forEach(button=>button.onclick=()=>{const area=$("entityNotes"),parts=button.dataset.md.split("|"),start=area.selectionStart,end=area.selectionEnd,selected=area.value.slice(start,end)||"text";area.setRangeText(parts[0]+selected+parts[1],start,end,"select");area.focus();area.dispatchEvent(new Event("input"))});

$("entityType").onchange=()=>{$("entityDialogTitle").textContent="Utwórz "+plType($("entityType").value);$("entityColor").value=ENTITY_DEFAULT_COLORS[$("entityType").value]||"#453452";$("entityBorderColor").value=ENTITY_DEFAULT_BORDER;$("entitySpecificFields").innerHTML='<div class="dialog-field-grid">'+TYPES[$("entityType").value].fields.map(label=>{const key=label.toLowerCase().replace(/[^a-z]+/g,"_");return '<label>'+esc(plField(label))+'<input data-field="'+key+'"></label>'}).join("")+"</div>"};
$("entityForm").onsubmit=e=>{e.preventDefault();const id=$("entityForm").dataset.editId,type=$("entityType").value,name=$("entityName").value.trim(),imageUrl=$("entityImage").value.trim();if(imageUrl&&!isImageUrl(imageUrl)){toast("Podaj adres obrazu PNG lub WEBP albo prześlij plik PNG/WEBP.");return}const fields={},customFields=[];$("entitySpecificFields").querySelectorAll("[data-field]").forEach(i=>{if(i.value.trim())fields[i.dataset.field]=i.value.trim()});$("customFields").querySelectorAll(".custom-field-row").forEach(row=>{const key=row.querySelector("[data-custom-key]").value.trim(),input=row.querySelector("[data-custom-value]");if(key){if(input.type==="checkbox"||input.value.trim())fields[key]=input.type==="checkbox"?String(input.checked):input.value.trim();customFields.push({key,type:row.querySelector("[data-custom-type]").value,options:row.querySelector("[data-custom-options]").value})}});let record;if(id){record=entity(id);Object.assign(record,{name,imageUrl,color:$("entityColor").value,borderColor:$("entityBorderColor").value,lineStyle:$("entityLineStyle").value,notes:$("entityNotes").value,fields,customFields})}else{record={id:uid("entity"),type,name,imageUrl,color:$("entityColor").value,borderColor:$("entityBorderColor").value,lineStyle:$("entityLineStyle").value,notes:$("entityNotes").value,fields,customFields};let initialPosition=null;const rawPosition=$("entityDialog").dataset.position;if(rawPosition){try{initialPosition=JSON.parse(rawPosition)}catch(_){}}closeDialogs();beginEntityPlacement(record,initialPosition);return}closeDialogs();markDirty();setSelection("entity",record.id);toast("Zaktualizowano obiekt.")};
function addCustomField(key="",value="",type="text",options=""){
 const row=document.createElement("div");row.className="custom-field-row";
 row.innerHTML='<input data-custom-key placeholder="Nazwa właściwości" value="'+esc(key)+'"><select data-custom-type><option value="text">Tekst</option><option value="number">Liczba</option><option value="date">Data</option><option value="select">Lista rozwijana</option><option value="checkbox">Pole wyboru</option><option value="entity">Odwołanie do obiektu</option></select><input data-custom-value placeholder="Wartość"><input data-custom-options placeholder="Opcje listy (oddzielone przecinkami)" hidden><button type="button" class="icon-button" aria-label="Usuń właściwość">×</button>';
 const kind=row.querySelector("[data-custom-type]"),opts=row.querySelector("[data-custom-options]");kind.value=type;opts.value=options;
 function setControl(t,v){let old=row.querySelector("[data-custom-value]"),el;
  if(t==="select"){el=document.createElement("select");el.dataset.customValue="";el.innerHTML=opts.value.split(",").map(x=>x.trim()).filter(Boolean).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");el.value=v}
  else{el=document.createElement("input");el.dataset.customValue="";el.placeholder="Wartość";el.type=t==="checkbox"?"checkbox":t==="number"||t==="date"?t:"text";if(t==="checkbox")el.checked=v==="true";else el.value=v||"";if(t==="entity")el.setAttribute("list","entityReferenceOptions")}
  old.replaceWith(el);opts.hidden=t!=="select";
 }
 setControl(type,value);
 kind.onchange=()=>setControl(kind.value,"");
 opts.oninput=()=>{if(kind.value==="select"){const v=row.querySelector("[data-custom-value]").value;setControl("select",v)}};
 row.querySelector("button").onclick=()=>row.remove();$("customFields").append(row);
}
$("addCustomField").onclick=()=>addCustomField();
$("entityImageFile").onchange=e=>{const file=e.target.files?.[0];if(!file)return;if(!["image/png","image/webp"].includes(file.type)){toast("Obsługiwane są wyłącznie grafiki PNG i WEBP.");e.target.value="";return}if(file.size>5*1024*1024){toast("Obraz nie może przekraczać 5 MB.");e.target.value="";return}const reader=new FileReader();reader.onload=()=>{$("entityImage").value=reader.result;$("imagePreview").innerHTML='<img src="'+reader.result+'" alt="Podgląd obrazu">';$("imagePreview").hidden=false};reader.readAsDataURL(file)};
function createEntity(type,position){openEntityDialog(type);$("entityDialog").dataset.position=position?JSON.stringify(position):""}
function beginEntityPlacement(record,initialPosition=null){
 cancelEntityPlacement(false);
 const rect=graphSurface.getBoundingClientRect(),start=initialPosition||{x:(innerWidth/2-cy.pan().x)/cy.zoom(),y:(innerHeight/2-cy.pan().y)/cy.zoom()};
 const previewId=uid("placement");
 pendingPlacement={record,previewId,position:start};
 cy.add({group:"nodes",data:{id:previewId,name:record.name,label:TYPES[record.type].glyph+" "+record.name,type:record.type,glyph:TYPES[record.type].glyph,shape:TYPES[record.type].shape,image:record.imageUrl||""},position:start,classes:"placement-preview",grabbable:false});
 graphSurface.classList.add("placing-entity");
 toast("Przesuń podgląd w puste miejsce i kliknij lewym przyciskiem, aby umieścić obiekt. Naciśnij Esc, aby anulować.");
}
function cancelEntityPlacement(showMessage=true){
 if(!pendingPlacement)return;
 const preview=cy?.getElementById(pendingPlacement.previewId);if(preview?.length)preview.remove();
 pendingPlacement=null;graphSurface.classList.remove("placing-entity");
 if(showMessage)toast("Anulowano umieszczanie obiektu.");
}
function updateEntityPlacement(clientX,clientY){
 if(!pendingPlacement||!cy)return;
 const rect=graphSurface.getBoundingClientRect(),pan=cy.pan(),zoom=cy.zoom();
 const position={x:(clientX-rect.left-pan.x)/zoom,y:(clientY-rect.top-pan.y)/zoom};
 pendingPlacement.position=position;const preview=cy.getElementById(pendingPlacement.previewId);if(preview.length)preview.position(position);
}
function commitEntityPlacement(position){
 if(!pendingPlacement)return;
 const pending=pendingPlacement,preview=cy.getElementById(pending.previewId);if(preview.length)preview.remove();
 pendingPlacement=null;graphSurface.classList.remove("placing-entity");
 saveCurrentPositions();
 const record=pending.record;record.position=clone(position||pending.position);record.positions={...(record.positions||{}),[activeView]:clone(position||pending.position)};
 data.entities.push(record);selected=null;markDirty();setSelection("entity",record.id);toast("Umieszczono obiekt.");
}
graphSurface.addEventListener("mousemove",e=>updateEntityPlacement(e.clientX,e.clientY));
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(pendingPlacement){e.preventDefault();cancelEntityPlacement();return}if(selected){e.preventDefault();clearSelection()}});

function confirm(message,action){$("confirmMessage").textContent=message;confirmAction=action;openDialog("confirmDialog")}
$("cancelConfirm").onclick=closeDialogs;$("acceptConfirm").onclick=()=>{const fn=confirmAction;closeDialogs();confirmAction=null;fn?.()};
function deleteEntity(e){const count=data.relationships.filter(r=>r.source===e.id||r.target===e.id).length;confirm("Usunąć "+e.name+"? "+count+" powiązanych relacji również zostanie usuniętych.",()=>{data.entities=data.entities.filter(x=>x.id!==e.id);data.relationships=data.relationships.filter(r=>r.source!==e.id&&r.target!==e.id);if(selected?.id===e.id)selected=null;markDirty();toast("Usunięto obiekt.")})}
function deleteRelationship(r){confirm("Usunąć "+r.type+" relację?",()=>{data.relationships=data.relationships.filter(x=>x.id!==r.id);if(selected?.id===r.id)selected=null;markDirty();toast("Usunięto relację.")})}
function relationshipTypePreset(name){return(data.metadata.relationshipTypes||[]).find(t=>t.name===name)||data.relationships.find(r=>r.type===name)||null}
function startRelationshipWizard(existing=null,source=null,target=null){
 const preset=relationshipTypePreset(existing?.type);
 wizard={existingId:existing?.id||null,step:existing?2:source&&target?2:source?1:0,source:source||existing?.source||null,target:target||existing?.target||null,form:existing?{...clone(existing),description:preset?.description||""}:{type:"",note:"",color:"#d8bb63",lineStyle:"solid",direction:"none",description:""}};renderWizard();openDialog("relationshipDialog")
}
function renderWizard(){
 const host=$("relationshipWizard"),s=wizard.step;$("relationshipDialogTitle").textContent=wizard.existingId?"Edytuj relację":"Utwórz relację";
 if(s<2){const first=s===0,choices=data.entities.filter(e=>e.id!==(first?null:wizard.source));host.innerHTML='<div class="wizard-step">KROK '+(s+1)+' / 3 · WYBIERZ '+(first?"PIERWSZY":"DRUGI")+' OBIEKT</div><div class="wizard-options">'+choices.map(e=>'<button data-pick="'+e.id+'" class="'+((first?wizard.source:wizard.target)===e.id?"selected":"")+'"><strong>'+esc(e.name)+'</strong><br><span class="muted">'+({Person:"Postać",Family:"Rodzina",Faction:"Stronnictwo",Object:"Przedmiot",Event:"Wydarzenie",Institution:"Instytucja",Location:"Lokalizacja"}[e.type]||e.type)+'</span></button>').join("")+'</div><div class="wizard-actions"><button class="subtle-button" data-cancel>Anuluj</button><button class="primary-button" data-next '+((first?!wizard.source:!wizard.target)?"disabled":"")+' >Dalej</button></div>';host.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{if(first)wizard.source=b.dataset.pick;else wizard.target=b.dataset.pick;renderWizard()});host.querySelector("[data-next]").onclick=()=>{wizard.step++;renderWizard()}}
 else{const types=[...new Set([...(data.metadata.relationshipTypes||[]).map(t=>t.name),...data.relationships.map(r=>r.type)])];host.innerHTML='<div class="wizard-step">KROK 3 / 3 · SZCZEGÓŁY RELACJI</div><p class="muted">'+esc(entity(wizard.source)?.name)+" → "+esc(entity(wizard.target)?.name)+'</p><section class="relationship-type-section"><h3>Typ relacji</h3><label>Typ relacji<input id="wType" list="wTypes" maxlength="80" value="'+esc(wizard.form.type)+'" placeholder="SOJUSZNIK, WRÓG, KONTROLUJE" required></label><datalist id="wTypes">'+types.map(t=>'<option value="'+esc(t)+'" label="'+esc(plRelType(t))+'">').join("")+'</datalist><label>Opis typu relacji<input id="wTypeDescription" maxlength="240" value="'+esc(wizard.form.description||"")+'" placeholder="Znaczenie tego typu relacji"></label></section><label>Dłuższa notatka · składnia Markdown</label><div class="markdown-toolbar"><button type="button" data-rel-md="**|**">Pogrubienie</button><button type="button" data-rel-md="*|*">Kursywa</button><button type="button" data-rel-md="## |">Nagłówek</button><button type="button" id="relPreviewToggle">Podgląd</button></div><textarea id="wNote" rows="4">'+esc(wizard.form.note)+'</textarea><div id="relNotesPreview" class="markdown-preview" hidden></div><section class="relationship-style-section"><h3>Style</h3><div class="dialog-field-grid"><label>Kolor<input id="wColor" type="color" value="'+esc(wizard.form.color)+'"></label><label >Styl linii<select id="wLine"><option value="solid">Prosta / ciągła</option><option value="dotted">Kropkowana</option><option value="dashed">Przerywana</option></select></label><label>Kierunek strzałki<select id="wDirection"><option value="none">Brak</option><option value="towards">Do</option><option value="from">Od</option><option value="mutual">Dwukierunkowa</option></select></label></div></section><div class="wizard-actions"><button class="subtle-button" data-back>Wstecz</button><button class="primary-button" id="saveRel">Zapisz relację</button></div>';$("wLine").value=wizard.form.lineStyle;$("wDirection").value=wizard.form.direction;const relNote=$("wNote"),relPreview=$("relNotesPreview");relNote.addEventListener("input",()=>{if(!relPreview.hidden)relPreview.innerHTML=md(relNote.value)});host.querySelectorAll("[data-rel-md]").forEach(button=>button.onclick=()=>{const parts=button.dataset.relMd.split("|"),start=relNote.selectionStart,end=relNote.selectionEnd,selected=relNote.value.slice(start,end)||"text";relNote.setRangeText(parts[0]+selected+parts[1],start,end,"select");relNote.focus();relNote.dispatchEvent(new Event("input"))});$("relPreviewToggle").onclick=()=>{relPreview.hidden=!relPreview.hidden;relPreview.innerHTML=md(relNote.value);$("relPreviewToggle").textContent=relPreview.hidden?"Podgląd":"Edytuj źródło"};const syncType=()=>{const chosen=$("wType").value.trim();if(!chosen||chosen===wizard.form.type)return;const preset=relationshipTypePreset(chosen);if(preset)Object.assign(wizard.form,preset);else{wizard.form.description="";wizard.form.color="#d8bb63";wizard.form.lineStyle="solid";wizard.form.direction="none"}wizard.form.type=chosen;$("wTypeDescription").value=wizard.form.description||"";$("wColor").value=wizard.form.color;$("wLine").value=wizard.form.lineStyle;$("wDirection").value=wizard.form.direction};$("wType").addEventListener("change",syncType);host.querySelector("[data-back]").onclick=()=>{wizard.form.type=$("wType").value.trim();wizard.form.note=relNote.value;wizard.form.description=$("wTypeDescription").value;wizard.form.color=$("wColor").value;wizard.form.lineStyle=$("wLine").value;wizard.form.direction=$("wDirection").value;wizard.step=1;renderWizard()};$("saveRel").onclick=()=>{syncType();const chosen=$("wType").value.trim();if(!chosen){toast("Wprowadź typ relacji.");$("wType").focus();return}const r={id:wizard.existingId||uid("rel"),source:wizard.source,target:wizard.target,type:chosen,note:relNote.value,color:$("wColor").value,lineStyle:$("wLine").value,direction:$("wDirection").value};data.metadata.relationshipTypes=Array.isArray(data.metadata.relationshipTypes)?data.metadata.relationshipTypes:[];const preset={name:r.type,description:$("wTypeDescription").value,color:r.color,lineStyle:r.lineStyle,direction:r.direction};const existingPreset=data.metadata.relationshipTypes.find(x=>x.name===r.type);if(existingPreset)Object.assign(existingPreset,preset);else data.metadata.relationshipTypes.push(preset);if(wizard.existingId)Object.assign(rel(wizard.existingId),r);else data.relationships.push(r);data.relationships.filter(x=>x.type===r.type).forEach(x=>Object.assign(x,{color:r.color,lineStyle:r.lineStyle,direction:r.direction}));closeDialogs();markDirty();capture();renderGraph();renderFilters();renderLegend();updateCount();setSelection("relationship",r.id);persistLocal();toast("Zapisano relację.")}}
 host.querySelector("[data-cancel]")?.addEventListener("click",closeDialogs)
}
function saveCurrentPositions(){
 data.entities.forEach(record=>{const node=cy.getElementById(record.id);if(node.length){record.positions=record.positions||{};record.positions[activeView]=node.position()}});
 layoutModes[activeView]="manual";data.metadata.layoutModes={...(data.metadata.layoutModes||{}),[activeView]:"manual"};setDirty(true);persistLocal();
}
function hideContext(){$("contextMenu").hidden=true}
function placeMenu(p){const m=$("contextMenu");m.hidden=false;m.classList.remove("opens-left");m.style.left=Math.max(6,Math.min(p.x,innerWidth-215))+"px";m.style.top=Math.max(6,Math.min(p.y,innerHeight-180))+"px";if(p.x+410>innerWidth)m.classList.add("opens-left")}
function createObjectMenuMarkup(){return '<div class="context-menu-item has-submenu"><button type="button" aria-haspopup="true">Utwórz nowy obiekt… <span class="submenu-arrow">›</span></button><div class="context-submenu" role="menu">'+TYPE_NAMES.map(t=>'<button type="button" data-type="'+esc(t)+'">'+esc(TYPES[t].glyph)+'　'+esc(plType(t))+'</button>').join("")+'</div></div>'}
function bindCreateObjectMenu(position){const root=$("contextMenu").querySelector(".has-submenu");root?.querySelectorAll("[data-type]").forEach(b=>b.onclick=()=>{hideContext();createEntity(b.dataset.type,position||null)})}
function entityMenu(e,p){$("contextMenu").innerHTML='<button data-a="dossier">Otwórz kartę rekordu</button><button data-a="edit">Edytuj obiekt</button><button data-a="rel">Utwórz relację</button>'+createObjectMenuMarkup()+(e.type==="Family"||e.type==="Faction"?'<button data-a="special">Otwórz '+(e.type==="Family"?"Drzewo rodziny":"Graf organizacji")+'</button>':"")+'<button data-a="delete">Usuń obiekt</button>';placeMenu(p);bindCreateObjectMenu(null);$("contextMenu").querySelector('[data-a="dossier"]').onclick=()=>{hideContext();setSelection("entity",e.id)};$("contextMenu").querySelector('[data-a="edit"]').onclick=()=>{hideContext();openEntityDialog(e.type,e)};$("contextMenu").querySelector('[data-a="rel"]').onclick=()=>{hideContext();startRelationshipWizard(null,e.id)};$("contextMenu").querySelector('[data-a="delete"]').onclick=()=>{hideContext();deleteEntity(e)};$("contextMenu").querySelector('[data-a="special"]')?.addEventListener("click",()=>{hideContext();openSpecial(e.type==="Family"?"family":"organization",e)})}
function relationMenu(r,p){$("contextMenu").innerHTML='<button data-a="dossier">Otwórz kartę rekordu</button><button data-a="edit">Edytuj relację</button><button data-a="delete">Usuń relację</button>';placeMenu(p);$("contextMenu").querySelector('[data-a="dossier"]').onclick=()=>{hideContext();setSelection("relationship",r.id)};$("contextMenu").querySelector('[data-a="edit"]').onclick=()=>{hideContext();startRelationshipWizard(r)};$("contextMenu").querySelector('[data-a="delete"]').onclick=()=>{hideContext();deleteRelationship(r)}}
function entitySubmenu(p){$("contextMenu").innerHTML=createObjectMenuMarkup();placeMenu(p);bindCreateObjectMenu(p.graphPosition)}
function openSpecial(view,root){capture();activeView=view;selected={kind:"entity",id:root.id};renderGraph();layout("hierarchy",true);focusEntity(root.id);openTab("view");$("dossierWindow").hidden=false}
$("entitySearch").addEventListener("input",()=>{const q=$("entitySearch").value.trim().toLocaleLowerCase();if(!q){$("searchResults").textContent="";return}const matches=data.entities.filter(e=>(e.name+" "+Object.values(e.fields||{}).join(" ")).toLocaleLowerCase().includes(q)).slice(0,6);$("searchResults").textContent=matches.length?matches.map(e=>e.name+" · "+e.type).join(" / "):"Nie znaleziono pasujących obiektów";});
$("entitySearch").addEventListener("keydown",e=>{if(e.key!=="Enter")return;const q=$("entitySearch").value.trim().toLocaleLowerCase();const match=data.entities.find(x=>(x.name+" "+Object.values(x.fields||{}).join(" ")).toLocaleLowerCase().includes(q));if(match){openTab("view");let n=cy.getElementById(match.id);if(!n.length&&activeView!=="complete"){capture();activeView="complete";renderGraph();n=cy.getElementById(match.id)}if(n.length)n.style("display","element");setSelection("entity",match.id);focusEntity(match.id);$("searchResults").textContent="Wybrano: "+match.name}else toast("Nie znaleziono pasującego obiektu.");});
$("closeDossier").onclick=()=>{$("dossierWindow").hidden=true};

$("createEntity").onclick=()=>createEntity("Person");
$("createRelationship").onclick=()=>{if(data.entities.length<2){toast("Najpierw utwórz co najmniej dwa obiekty.");return}startRelationshipWizard()};
$("resetView").onclick=()=>{capture();layout("force",true);setDirty(true);persistLocal()};
$("zoomIn").onclick=()=>cy.zoom({level:cy.zoom()*1.2,renderedPosition:{x:innerWidth/2,y:innerHeight/2}});$("zoomOut").onclick=()=>cy.zoom({level:cy.zoom()/1.2,renderedPosition:{x:innerWidth/2,y:innerHeight/2}});
$("toggleLegend").onchange=e=>$("legend").hidden=!e.target.checked;$("closeLegend").onclick=()=>{$("legend").hidden=true;$("toggleLegend").checked=false};
function applyLabelStyles(){
  if(!cy)return;
  const entityOpacity=entityLabelMode==="always"?1:0,relationshipOpacity=relationshipLabelMode==="always"?1:0;
  const entityValign={above:"top",middle:"center",below:"bottom"}[entityLabelPosition];
  const relationshipMargin={above:-12,middle:0,below:12}[relationshipLabelPosition];
  cy.nodes().style({"text-opacity":entityOpacity,"text-valign":entityValign,"text-margin-y":0,"font-size":labelStage===2?26:labelStage===3?13:9});
  cy.edges().style({"text-opacity":relationshipOpacity,"text-margin-y":relationshipMargin,"font-size":labelStage===2?11:labelStage===3?10:7});
}
function bindThreeStateControls(selector,read,set){
  document.querySelectorAll(selector).forEach(group=>{
    group.querySelectorAll("button").forEach(button=>button.onclick=()=>{
      set(button.dataset.value);
      group.querySelectorAll("button").forEach(other=>other.setAttribute("aria-pressed",String(other===button)));
      applyLabelStyles();
    });
    group.querySelectorAll("button").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.value===read())));
  });
}
bindThreeStateControls("[data-label-position-group=entity]",()=>entityLabelPosition,v=>entityLabelPosition=v);
bindThreeStateControls("[data-label-position-group=relationship]",()=>relationshipLabelPosition,v=>relationshipLabelPosition=v);
bindThreeStateControls("[data-label-mode-group=entity]",()=>entityLabelMode,v=>entityLabelMode=v);
bindThreeStateControls("[data-label-mode-group=relationship]",()=>relationshipLabelMode,v=>relationshipLabelMode=v);
$("labelStages").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("labelStages").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));labelStage=Number(b.dataset.stage);applyLabelStyles()});
$("exportData").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)+"\n"],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="dragons-due-relationships.json";a.click();URL.revokeObjectURL(url);toast("Wyeksportowano cały zestaw danych.")};
$("uploadData").onclick=()=>{ $("githubToken").value="";openDialog("githubTokenDialog");$("githubToken").focus() };
$("githubTokenForm").onsubmit=async event=>{
 event.preventDefault();
 const button=$("uploadData"),originalLabel=button.textContent,token=$("githubToken").value.trim();
 $("githubToken").value="";
 if(!token){toast("Wklej token GitHub, aby wysłać dane.");return}
 button.disabled=true;button.textContent="Wysyłanie…";closeDialogs();
 try{
  const fileContent=JSON.stringify(data,null,2)+"\\n";
  const bytes=new TextEncoder().encode(fileContent);
  let binary="";
  for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);
  const relationshipsB64=btoa(binary);
  if(relationshipsB64.length>60000)throw new Error("Zestaw danych jest za duży do wysłania tą metodą (limit 60 000 znaków).");
  const response=await fetch("https://api.github.com/repos/vengrathdm/vengrathdm.github.io/dispatches",{
   method:"POST",
   headers:{
    "Authorization":"Bearer "+token,
    "Accept":"application/vnd.github+json",
    "Content-Type":"application/json",
    "X-GitHub-Api-Version":"2022-11-28"
   },
   body:JSON.stringify({event_type:"update_relationships",client_payload:{relationships_b64:relationshipsB64}})
  });
  if(!response.ok){
   const errorBody=await response.text();
   throw new Error("GitHub odrzucił żądanie ("+response.status+"): "+errorBody);
  }
  toast("Wysłano dane do GitHub Actions. Po zakończeniu workflow plik relationships.json zostanie zaktualizowany.");
 }catch(error){
  console.error("Błąd wysyłania danych na GitHub:",error);
  toast("Nie udało się wysłać danych: "+error.message);
 }finally{
  button.disabled=false;button.textContent=originalLabel;
 }
};
$("importData").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=normalize(JSON.parse(await f.text()));confirm("Import zastąpi bieżący zestaw roboczy. Kontynuować?",()=>{data=parsed;layoutModes={...layoutModes,...(data.metadata.layoutModes||{})};selected=null;activeView="complete";persistLocal();viewports={complete:null,family:null,organization:null,political:null,characters:null};setDirty(true);renderGraph();renderFilters();renderLegend();openTab("view");toast("Zaimportowano zestaw danych.")})}catch(err){toast("Import nie powiódł się: "+err.message)}e.target.value=""};
$("reloadOfficial").onclick=()=>{const run=async()=>{try{officialData=await fetchOfficial();await clearLocal();data=clone(officialData);layoutModes={complete:"force",family:"hierarchy",organization:"hierarchy",political:"force",characters:"force"};selected=null;viewports={complete:null,family:null,organization:null};setDirty(false);renderGraph();renderFilters();renderLegend();openTab("view");toast("Ponownie wczytano dane oficjalne.")}catch(e){toast(e.message)}};if(dirty)confirm("Ponownie wczytać dane oficjalne i odrzucić wszystkie niewyeksportowane zmiany?",run);else run()};

document.addEventListener("click",e=>{if(!e.target.closest("#contextMenu"))hideContext()});
cy=cytoscape({container:$("graph"),elements:[],minZoom:.12,maxZoom:3,wheelSensitivity:.22,selectionType:"single",boxSelectionEnabled:false});
cy.on("mouseover","node",e=>{if(entityLabelMode==="hover")e.target.style("text-opacity",1)});
cy.on("mouseout","node",e=>{if(entityLabelMode==="hover")e.target.style("text-opacity",0)});
cy.on("mouseover","edge",e=>{if(relationshipLabelMode==="hover")e.target.style("text-opacity",1)});
cy.on("mouseout","edge",e=>{if(relationshipLabelMode==="hover")e.target.style("text-opacity",0)});

function graphElementAt(renderedX,renderedY){
 const node=cy.nodes().filter(n=>{const b=n.renderedBoundingBox();return renderedX>=b.x1-3&&renderedX<=b.x2+3&&renderedY>=b.y1-3&&renderedY<=b.y2+3}).sort((a,b)=>{const pa=a.renderedPosition(),pb=b.renderedPosition();return Math.hypot(pa.x-renderedX,pa.y-renderedY)-Math.hypot(pb.x-renderedX,pb.y-renderedY)}).first();
 if(node.length)return node;
 let nearest=null,nearestDistance=11;
 cy.edges().forEach(edge=>{const a=edge.source().renderedPosition(),b=edge.target().renderedPosition(),dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;const t=len2?Math.max(0,Math.min(1,((renderedX-a.x)*dx+(renderedY-a.y)*dy)/len2)):0;const distance=Math.hypot(renderedX-(a.x+t*dx),renderedY-(a.y+t*dy));if(distance<nearestDistance){nearestDistance=distance;nearest=edge}});
 return nearest;
}

cy.on("tap",e=>{if(e.target!==cy)return;if(pendingPlacement)commitEntityPlacement(e.position);else if(selected)clearSelection()});cy.on("tap","node",e=>setSelection("entity",e.target.id()));cy.on("tap","edge",e=>setSelection("relationship",e.target.id()));
cy.on("dbltap","node",e=>{setSelection("entity",e.target.id());$("dossierWindow").hidden=false;focusEntity(e.target.id())});
cy.on("dragfree","node",e=>{const n=e.target,at=n.renderedPosition(),target=cy.nodes().filter(x=>x.id()!==n.id()&&x.renderedBoundingBox().x1<=at.x&&x.renderedBoundingBox().x2>=at.x&&x.renderedBoundingBox().y1<=at.y&&x.renderedBoundingBox().y2>=at.y).first();saveCurrentPositions();if(target.length)startRelationshipWizard(null,n.id(),target.id())});
cy.on("pan zoom",capture);
async function init(){try{officialData=await fetchOfficial();await clearLocal();data=clone(officialData);setDirty(false);}catch(e){data={schemaVersion:1,metadata:{id:"dragons-due-relationships",name:"The Dragon's Due — Mapa relacji"},entities:[],relationships:[]};officialData=clone(data);setDirty(false);toast("Oficjalny plik JSON jest niedostępny: "+e.message)}layoutModes={...layoutModes,...(data.metadata.layoutModes||{})};renderGraph();renderFilters();renderLegend();updateCount();$("entityReferenceOptions")?.remove();const dl=document.createElement("datalist");dl.id="entityReferenceOptions";dl.innerHTML=data.entities.map(e=>'<option value="'+esc(e.name)+'">').join("");document.body.append(dl)}
init();