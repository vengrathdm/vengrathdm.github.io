const DATA_URL="./data/relationships.json";
const TYPES={Person:{glyph:"♙",shape:"ellipse",fields:["Role","Age","Affiliation"]},Family:{glyph:"⚜",shape:"hexagon",fields:["Seat / estate","Motto"]},Faction:{glyph:"⚑",shape:"diamond",fields:["Purpose","Headquarters","Leader"]},Object:{glyph:"✧",shape:"star",fields:["Object type","Custodian"]},Event:{glyph:"◷",shape:"triangle",fields:["Date / period","Venue"]},Institution:{glyph:"♜",shape:"rectangle",fields:["Institution type","Jurisdiction","Authority"]},Location:{glyph:"⌂",shape:"round-rectangle",fields:["Location type","Area"]}};
let TYPE_NAMES=Object.keys(TYPES);
const $=id=>document.getElementById(id),uid=p=>p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),clone=x=>JSON.parse(JSON.stringify(x));
const BUILTIN_TYPES=clone(TYPES);
let officialData,data,dirty=false,selected=null,activeTab="view",activeView="complete",layoutModes={complete:"force",family:"hierarchy",organization:"hierarchy",political:"force",characters:"force"},wizard=null,confirmAction=null,viewports={complete:null,family:null,organization:null,political:null,characters:null},toastTimer;
let cy,labelStage=3;
const STORAGE_KEY="heartwell.relationshipMap.v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const isImageUrl=value=>{if(/^data:image\/(png|webp);base64,/i.test(value))return true;try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&/\.(png|webp)$/i.test(u.pathname)}catch(_){return false}};
const md=s=>esc(s).split("\n").map(line=>line.replace(/^### (.+)$/,"<h4>$1</h4>").replace(/^## (.+)$/,"<h3>$1</h3>").replace(/^# (.+)$/,"<h2>$1</h2>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/\x60([^\x60]+)\x60/g,"<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^ )]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')).map(line=>/^[-*] /.test(line)?"<li>"+line.slice(2)+"</li>":line).join("<br>").replace(/(?:<br>){2,}/g,"<br>");
const entity=id=>data.entities.find(x=>x.id===id),rel=id=>data.relationships.find(x=>x.id===id);
function toast(s){$("toast").textContent=s;$("toast").classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("visible"),2800)}
function setDirty(v){dirty=v;$("dirtyState").textContent=v?"Working copy modified · local autosave pending":"Official data loaded · no unsaved changes";$("dirtyState").style.color=v?"#efc27a":"#b7ad98"}
let saveTimer;
function openLocalDb(){return new Promise((resolve,reject)=>{if(!("indexedDB" in window)){reject(Error("IndexedDB unavailable"));return}const request=indexedDB.open("HeartwellRelationshipMap",1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains("state"))request.result.createObjectStore("state",{keyPath:"id"})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function persistLocal(){
 clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{
  try{const db=await openLocalDb();await new Promise((resolve,reject)=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").put({id:"working",data});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();$("persistenceState").textContent="Local autosave · saved in this browser";$("persistenceState").style.color="#b7c89c"}
  catch(err){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));$("persistenceState").textContent="Local autosave · saved in this browser";$("persistenceState").style.color="#b7c89c"}catch(_){$("persistenceState").textContent="Local autosave unavailable · export a backup";$("persistenceState").style.color="#efc27a"}}
 },180);
}
async function restoreLocal(){
 try{const db=await openLocalDb();const saved=await new Promise((resolve,reject)=>{const req=db.transaction("state","readonly").objectStore("state").get("working");req.onsuccess=()=>resolve(req.result?.data||null);req.onerror=()=>reject(req.error)});db.close();if(saved){data=normalize(saved);setDirty(true);$("persistenceState").textContent="Restored local working copy";return true}}
 catch(_){}
 try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;data=normalize(JSON.parse(raw));setDirty(true);$("persistenceState").textContent="Restored local working copy";return true}
 catch(err){$("persistenceState").textContent="Saved local copy could not be read";return false}
}
async function clearLocal(){try{const db=await openLocalDb();await new Promise(resolve=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").delete("working");tx.oncomplete=resolve;tx.onerror=resolve});db.close()}catch(_){}localStorage.removeItem(STORAGE_KEY)}
function applyEntityTypes(metadata){
 Object.keys(TYPES).forEach(k=>delete TYPES[k]);Object.assign(TYPES,clone(BUILTIN_TYPES));
 (Array.isArray(metadata?.entityTypes)?metadata.entityTypes:[]).forEach(def=>{
  if(!def||typeof def.name!=="string"||!/^[\p{L}\p{N} _-]{2,32}$/u.test(def.name)||TYPES[def.name]||!["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(def.shape)||typeof def.glyph!=="string"||!def.glyph.trim())return;
  TYPES[def.name]={glyph:def.glyph.slice(0,4),shape:def.shape,fields:Array.isArray(def.fields)?def.fields.filter(x=>typeof x==="string").slice(0,12):[]};
 });
 Object.entries(metadata?.entityTypeOverrides||{}).forEach(([name,def])=>{if(TYPES[name]&&def&&["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(def.shape))TYPES[name]={...TYPES[name],glyph:String(def.glyph||TYPES[name].glyph).slice(0,4),shape:def.shape,fields:Array.isArray(def.fields)?def.fields:TYPES[name].fields}});
 TYPE_NAMES=Object.keys(TYPES);
}
function normalize(source){
 if(!source||typeof source!=="object"||source.schemaVersion!==1||!Array.isArray(source.entities)||!Array.isArray(source.relationships))throw Error("Expected schemaVersion 1 with entities and relationships arrays.");
 const metadata=source.metadata&&typeof source.metadata==="object"?source.metadata:{id:"heartwell-relationships",name:"Heartwell Relationship Map"};
 applyEntityTypes(metadata);
 const ids=new Set();
 const entities=source.entities.map(e=>{
  if(!e||typeof e.id!=="string"||!e.id||typeof e.name!=="string"||!e.name.trim()||!TYPES[e.type]||ids.has(e.id))throw Error("An entity has an invalid id, name, or type.");
  ids.add(e.id);if(e.imageUrl&&!isImageUrl(e.imageUrl))throw Error("Entity graphics must be PNG or WEBP images using HTTPS/HTTP or an embedded upload.");
  return{id:e.id,type:e.type,name:e.name.trim(),imageUrl:e.imageUrl||"",notes:typeof e.notes==="string"?e.notes:"",fields:e.fields&&typeof e.fields==="object"?e.fields:{},customFields:Array.isArray(e.customFields)?e.customFields:[],positions:e.positions&&typeof e.positions==="object"?e.positions:{},position:e.position||null};
 });
 const relationshipIds=new Set();
 const relationships=source.relationships.map(r=>{
  if(!r||typeof r.id!=="string"||!r.id||relationshipIds.has(r.id)||!ids.has(r.source)||!ids.has(r.target)||r.source===r.target||typeof r.type!=="string"||!r.type.trim())throw Error("A relationship has an invalid id, type, or endpoint.");
  relationshipIds.add(r.id);
  if(!["none","towards","from","mutual"].includes(r.direction||"none")||!["solid","dotted","dashed"].includes(r.lineStyle||"solid")||!/^#[0-9a-f]{6}$/i.test(r.color||"#d4a03c"))throw Error("Invalid relationship styling.");
  return{id:r.id,source:r.source,target:r.target,type:r.type.trim(),note:typeof r.note==="string"?r.note:"",color:r.color||"#d4a03c",lineStyle:r.lineStyle||"solid",direction:r.direction||"none"};
 });
 return{schemaVersion:1,metadata,entities,relationships};
}
async function fetchOfficial(){const r=await fetch(DATA_URL,{cache:"no-store"});if(!r.ok)throw Error("Official data could not be loaded ("+r.status+").");return normalize(await r.json())}
function openTab(tab){activeTab=tab;document.querySelectorAll(".tab").forEach(b=>{const a=b.dataset.tab===tab;b.classList.toggle("active",a);b.setAttribute("aria-selected",String(a))});["view","editor"].forEach(k=>$(k+"Panel").hidden=k!==tab)}
function openDialog(id){$("modalShade").hidden=false;$(id).hidden=false;hideContext()}
function closeDialogs(){["entityDialog","relationshipDialog","confirmDialog"].forEach(id=>$(id).hidden=true);$("modalShade").hidden=true;wizard=null}
document.querySelectorAll("[data-close-dialog]").forEach(b=>b.onclick=closeDialogs);$("modalShade").onclick=()=>{if($("confirmDialog").hidden)closeDialogs()};
function updateCount(){$("graphCount").textContent=data.entities.length+" entities · "+data.relationships.length+" relationships"}
function updateEntityReferenceOptions(){const dl=$("entityReferenceOptions");if(dl)dl.innerHTML=data.entities.map(e=>'<option value="'+esc(e.name)+'">').join("")}
function markDirty(){setDirty(true);persistLocal();renderGraph();renderFilters();renderLegend();updateCount();updateEntityReferenceOptions()}
function nodeElements(es,rs){
 const counts=new Map();rs.forEach(r=>{const key=[r.source,r.target].sort().join("|");counts.set(key,(counts.get(key)||0)+1)});
 const nodes=es.map((e,i)=>({data:{id:e.id,name:e.name,label:TYPES[e.type].glyph+" "+e.name,type:e.type,glyph:TYPES[e.type].glyph,shape:TYPES[e.type].shape,image:e.imageUrl||"",fields:e.fields,notes:e.notes},position:e.positions?.[activeView]||e.position||{x:(i%5)*160-320,y:Math.floor(i/5)*135-180}}));
 const edges=rs.map(r=>({data:{id:r.id,source:r.source,target:r.target,type:r.type,note:r.note,color:r.color,lineStyle:r.lineStyle,direction:r.direction,curveStyle:counts.get([r.source,r.target].sort().join("|"))>1?"bezier":"straight"}}));
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
function layout(mode,fit=true){
 layoutModes[activeView]=mode;data.metadata.layoutModes={...(data.metadata.layoutModes||{}),[activeView]:mode};const opts=mode==="hierarchy"?{name:"breadthfirst",directed:true,spacingFactor:1.3,padding:55,animate:false,roots:cy.nodes().filter(n=>n.data("type")===(activeView==="family"?"Family":"Faction"))}:mode==="manual"?{name:"preset",fit:false}:{name:"cose",animate:false,randomize:false,idealEdgeLength:175,nodeRepulsion:9000,gravity:.2,fit};
 cy.layout(opts).run();$("activeViewLabel").textContent=(activeView==="complete"?"Complete Graph":activeView==="family"?"Family Tree":activeView==="organization"?"Organization Graph":activeView==="political"?"Political Network":"Character Network")+" · "+(mode==="hierarchy"?"Hierarchical":mode==="manual"?"Manual":"Force-directed");if(fit&&mode!=="manual")cy.fit(cy.elements(),55)
}
function renderGraph(){
 if(!cy)return;const v=viewData();cy.elements().remove();cy.add(nodeElements(v.entities,v.relationships));
 cy.nodes().forEach(n=>{if(entity(n.id())?.imageUrl)n.addClass("has-image")});
 cy.style().selector("node").style({width:68,height:68,shape:"data(shape)","background-color":"#26343a","border-width":2,"border-color":"#d4a03c",label:"data(label)",color:"#f1e6d0","font-family":"Voltaire","font-size":13,"text-valign":"center","text-halign":"center","text-wrap":"wrap","text-max-width":76,"text-outline-color":"#17252b","text-outline-width":2})
 .selector("node.has-image").style({"background-image":"data(image)","background-fit":"cover","background-clip":"node",label:"data(label)",color:"#f1e6d0","font-size":11,"text-background-color":"#17252b","text-background-opacity":.78,"text-background-padding":2})
 .selector("edge").style({width:2,"line-color":"data(color)","target-arrow-color":"data(color)","source-arrow-color":"data(color)","curve-style":"straight",label:"data(type)","font-family":"Courier Prime","font-size":10,"font-weight":"bold",color:"#f3ead7","text-background-color":"#17252b","text-background-opacity":.9,"text-background-padding":3,"text-rotation":"autorotate","text-margin-y":-8,"line-style":"solid","target-arrow-shape":"none","source-arrow-shape":"none"})
 .selector('edge[curveStyle="bezier"]').style({"curve-style":"bezier"}).selector('edge[lineStyle="dashed"]').style({"line-style":"dashed"}).selector('edge[lineStyle="dotted"]').style({"line-style":"dotted"})
 .selector('edge[direction="towards"]').style({"target-arrow-shape":"triangle"}).selector('edge[direction="from"]').style({"source-arrow-shape":"triangle"}).selector('edge[direction="mutual"]').style({"target-arrow-shape":"triangle","source-arrow-shape":"triangle"})
 .selector(".dimmed").style({opacity:.13}).selector(".selected").style({opacity:1,"border-width":4}).update();
 cy.nodes().style("text-opacity",$("showEntityLabels").checked?1:0).style("font-size",labelStage===2?26:labelStage===3?13:9);cy.edges().style("text-opacity",$("showRelationshipLabels").checked?1:0).style("font-size",labelStage===2?11:labelStage===3?10:7);
 layout(layoutModes[activeView]||(["complete","political","characters"].includes(activeView)?"force":"hierarchy"),false);if(viewports[activeView])cy.viewport(viewports[activeView]);else if(cy.elements().length)cy.fit(cy.elements(),55);
 if(selected){const el=cy.getElementById(selected.id);if(el.length){el.addClass("selected");if(selected.kind==="entity")el.closedNeighborhood().addClass("adjacent")}}
 updateCount();renderDossier();applyFilters();
}
function setSelection(kind,id){selected={kind,id};$("dossierWindow").hidden=false;cy.elements().removeClass("selected adjacent dimmed");const el=cy.getElementById(id);if(el.length){el.addClass("selected");const neighborhood=el.closedNeighborhood();neighborhood.addClass("adjacent");cy.elements().not(neighborhood).addClass("dimmed")}renderDossier()}
function renderFilters(){
 const oldEntities=new Map([...$("entityFilters").querySelectorAll("input")].map(i=>[i.dataset.entityFilter,i.checked]));
 const oldRelations=new Map([...$("relationshipFilters").querySelectorAll("input")].map(i=>[i.dataset.relFilter,i.checked]));
 $("entityFilters").innerHTML=TYPE_NAMES.map(t=>'<label class="check-row"><input type="checkbox" data-entity-filter="'+t+'" '+(oldEntities.get(t)===false?"":"checked")+'> '+t+"</label>").join("");
 const types=[...new Set(data.relationships.map(r=>r.type))].sort();
 $("relationshipFilters").innerHTML=types.length?types.map(t=>'<label class="check-row"><input type="checkbox" data-rel-filter="'+esc(t)+'" '+(oldRelations.get(t)===false?"":"checked")+'> '+esc(t)+"</label>").join(""):'<span class="muted">No relationship types yet.</span>';
 document.querySelectorAll("[data-entity-filter],[data-rel-filter]").forEach(i=>i.onchange=applyFilters)
}
function applyFilters(){if(!cy)return;const ets=[...document.querySelectorAll("[data-entity-filter]:checked")].map(i=>i.dataset.entityFilter),rts=[...document.querySelectorAll("[data-rel-filter]:checked")].map(i=>i.dataset.relFilter);cy.nodes().forEach(n=>n.style("display",ets.includes(n.data("type"))?"element":"none"));cy.edges().forEach(e=>e.style("display",rts.includes(e.data("type"))&&ets.includes(e.source().data("type"))&&ets.includes(e.target().data("type"))?"element":"none"))}
function renderLegend(){$("legendContent").innerHTML='<div class="legend-section"><h3>Entity types</h3>'+TYPE_NAMES.map(t=>'<div class="legend-row"><span class="legend-icon">'+TYPES[t].glyph+'</span>'+t+"</div>").join("")+'</div><div class="legend-section"><h3>Relationship types & colors</h3>'+[...new Map(data.relationships.map(r=>[r.type+"|"+r.color,{type:r.type,color:r.color}])).values()].map(({type,color})=>'<div class="legend-row"><span style="width:12px;height:12px;border-radius:50%;background:'+esc(color)+'"></span>'+esc(type)+"</div>").join("")+'</div><div class="legend-section"><h3>Line styles</h3><div class="legend-row"><span class="legend-line"></span> Solid</div><div class="legend-row"><span class="legend-line dashed"></span> Dashed</div><div class="legend-row"><span class="legend-line dotted"></span> Dotted</div><div class="legend-row">Arrow directions: none · towards · from · mutual</div></div>'}
function renderDossier(){
 const host=$("dossierContent");if(!selected){host.innerHTML='<div class="empty-dossier"><span class="empty-mark">✧</span><p>Select an entity or relationship to inspect its dossier.</p></div>';return}
 if(selected.kind==="entity"){const e=entity(selected.id);if(!e){selected=null;renderDossier();return}const fields=Object.entries(e.fields||{}).filter(([,v])=>String(v).trim());host.innerHTML='<div class="dossier-type">'+e.type+'</div><h3 class="dossier-name">'+esc(e.name)+'</h3>'+(e.imageUrl?'<img class="dossier-image" src="'+esc(e.imageUrl)+'" alt="">':"")+(fields.length?'<dl class="dossier-fields">'+fields.map(([k,v])=>"<dt>"+esc(k)+"</dt><dd>"+esc(v)+"</dd>").join("")+"</dl>":"")+'<div class="dossier-notes">'+(e.notes?md(e.notes):'<span class="muted">No notes recorded.</span>')+'</div><div class="dossier-actions"><button id="dossierEdit" class="subtle-button">Edit</button><button id="dossierDelete" class="danger-button">Delete</button></div>';$("dossierEdit").onclick=()=>openEntityDialog(e.type,e);$("dossierDelete").onclick=()=>deleteEntity(e)}
 else{const r=rel(selected.id);if(!r){selected=null;renderDossier();return}host.innerHTML='<div class="dossier-type">RELATIONSHIP · '+r.direction+'</div><h3 class="dossier-name">'+esc(entity(r.source)?.name||"?")+" ↔ "+esc(entity(r.target)?.name||"?")+'</h3><dl class="dossier-fields"><dt>Type</dt><dd>'+esc(r.type)+'</dd><dt>Color</dt><dd>'+esc(r.color)+'</dd><dt>Line</dt><dd>'+esc(r.lineStyle)+'</dd><dt>Direction</dt><dd>'+esc(r.direction)+'</dd></dl><div class="dossier-notes">'+(r.note?md(r.note):'<span class="muted">No note recorded.</span>')+'</div><div class="dossier-actions"><button id="dossierEdit" class="subtle-button">Edit</button><button id="dossierDelete" class="danger-button">Delete</button></div>';$("dossierEdit").onclick=()=>startRelationshipWizard(r);$("dossierDelete").onclick=()=>deleteRelationship(r)}
}
function focusEntity(id){const n=cy.getElementById(id);if(n.length)cy.animate({center:{eles:n},zoom:Math.max(cy.zoom(),1.15)},{duration:300})}
function openEntityDialog(type,e=null){
 $("entityDialog").dataset.position="";$("entityImageFile").value="";$("imagePreview").hidden=true;$("notesPreview").hidden=true;$("toggleNotesPreview").textContent="Preview";$("entityDialogTitle").textContent=(e?"Edit ":"Create ")+type;$("entityType").innerHTML=TYPE_NAMES.map(t=>'<option>'+t+"</option>").join("");$("entityType").value=type;$("entityType").disabled=!!e;$("entityName").value=e?.name||"";$("entityImage").value=e?.imageUrl||"";$("entityNotes").value=e?.notes||"";if(e?.imageUrl){$("imagePreview").innerHTML='<img src="'+e.imageUrl+'" alt="Image preview">';$("imagePreview").hidden=false}
 $("entitySpecificFields").innerHTML='<div class="dialog-field-grid">'+TYPES[type].fields.map(label=>{const key=label.toLowerCase().replace(/[^a-z]+/g,"_");return'<label>'+esc(label)+'<input data-field="'+key+'" value="'+esc(e?.fields?.[key]||"")+'"></label>'}).join("")+"</div>";
 $("customFields").innerHTML="";Object.entries(e?.fields||{}).filter(([k])=>!TYPES[type].fields.some(label=>label.toLowerCase().replace(/[^a-z]+/g,"_")===k)).forEach(([k,v])=>{const def=(e?.customFields||[]).find(x=>x.key===k)||{};addCustomField(k,v,def.type||"text",def.options||"")});
 $("entityForm").dataset.editId=e?.id||"";openDialog("entityDialog")
}
$("entityNotes").addEventListener("input",()=>{if(!$("notesPreview").hidden)$("notesPreview").innerHTML=md($("entityNotes").value)});
document.querySelectorAll("[data-md]").forEach(button=>button.onclick=()=>{const area=$("entityNotes"),parts=button.dataset.md.split("|"),start=area.selectionStart,end=area.selectionEnd,selected=area.value.slice(start,end)||"text";area.setRangeText(parts[0]+selected+parts[1],start,end,"select");area.focus();area.dispatchEvent(new Event("input"))});
$("toggleNotesPreview").onclick=()=>{const preview=$("notesPreview");preview.hidden=!preview.hidden;preview.innerHTML=md($("entityNotes").value);$("toggleNotesPreview").textContent=preview.hidden?"Preview":"Edit source"};
$("entityType").onchange=()=>{$("entityDialogTitle").textContent="Create "+$("entityType").value;$("entitySpecificFields").innerHTML='<div class="dialog-field-grid">'+TYPES[$("entityType").value].fields.map(label=>{const key=label.toLowerCase().replace(/[^a-z]+/g,"_");return '<label>'+esc(label)+'<input data-field="'+key+'"></label>'}).join("")+"</div>"};
$("entityForm").onsubmit=e=>{e.preventDefault();const id=$("entityForm").dataset.editId,type=$("entityType").value,name=$("entityName").value.trim(),imageUrl=$("entityImage").value.trim();if(imageUrl&&!isImageUrl(imageUrl)){toast("Provide a PNG or WEBP image URL or upload a PNG/WEBP image.");return}const fields={},customFields=[];$("entitySpecificFields").querySelectorAll("[data-field]").forEach(i=>{if(i.value.trim())fields[i.dataset.field]=i.value.trim()});$("customFields").querySelectorAll(".custom-field-row").forEach(row=>{const key=row.querySelector("[data-custom-key]").value.trim(),input=row.querySelector("[data-custom-value]");if(key&&(input.type==="checkbox"||input.value.trim())){fields[key]=input.type==="checkbox"?String(input.checked):input.value.trim();customFields.push({key,type:row.querySelector("[data-custom-type]").value,options:row.querySelector("[data-custom-options]").value})}});let record;if(id){record=entity(id);Object.assign(record,{name,imageUrl,notes:$("entityNotes").value,fields,customFields})}else{record={id:uid("entity"),type,name,imageUrl,notes:$("entityNotes").value,fields,customFields};const rawPosition=$("entityDialog").dataset.position;if(rawPosition){try{record.positions={[activeView]:JSON.parse(rawPosition)}}catch(_){}}data.entities.push(record)}closeDialogs();markDirty();setSelection("entity",record.id);toast(id?"Entity updated.":"Entity created.")};
function addCustomField(key="",value="",type="text",options=""){
 const row=document.createElement("div");row.className="custom-field-row";
 row.innerHTML='<input data-custom-key placeholder="Property name" value="'+esc(key)+'"><select data-custom-type><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="select">Dropdown</option><option value="checkbox">Checkbox</option><option value="entity">Entity reference</option></select><input data-custom-value placeholder="Value"><input data-custom-options placeholder="Dropdown options (comma-separated)" hidden><button type="button" class="icon-button" aria-label="Remove property">×</button>';
 const kind=row.querySelector("[data-custom-type]"),opts=row.querySelector("[data-custom-options]");kind.value=type;opts.value=options;
 function setControl(t,v){let old=row.querySelector("[data-custom-value]"),el;
  if(t==="select"){el=document.createElement("select");el.dataset.customValue="";el.innerHTML=opts.value.split(",").map(x=>x.trim()).filter(Boolean).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");el.value=v}
  else{el=document.createElement("input");el.dataset.customValue="";el.placeholder="Value";el.type=t==="checkbox"?"checkbox":t==="number"||t==="date"?t:"text";if(t==="checkbox")el.checked=v==="true";else el.value=v||"";if(t==="entity")el.setAttribute("list","entityReferenceOptions")}
  old.replaceWith(el);opts.hidden=t!=="select";
 }
 setControl(type,value);
 kind.onchange=()=>setControl(kind.value,"");
 opts.oninput=()=>{if(kind.value==="select"){const v=row.querySelector("[data-custom-value]").value;setControl("select",v)}};
 row.querySelector("button").onclick=()=>row.remove();$("customFields").append(row);
}
$("addCustomField").onclick=()=>addCustomField();
$("entityImageFile").onchange=e=>{const file=e.target.files?.[0];if(!file)return;if(!["image/png","image/webp"].includes(file.type)){toast("Only PNG and WEBP graphics are supported.");e.target.value="";return}if(file.size>5*1024*1024){toast("Image must be 5 MB or smaller.");e.target.value="";return}const reader=new FileReader();reader.onload=()=>{$("entityImage").value=reader.result;$("imagePreview").innerHTML='<img src="'+reader.result+'" alt="Image preview">';$("imagePreview").hidden=false};reader.readAsDataURL(file)};
function createEntity(type,position){openEntityDialog(type);$("entityDialog").dataset.position=position?JSON.stringify(position):""}
function confirm(message,action){$("confirmMessage").textContent=message;confirmAction=action;openDialog("confirmDialog")}
$("cancelConfirm").onclick=closeDialogs;$("acceptConfirm").onclick=()=>{const fn=confirmAction;closeDialogs();confirmAction=null;fn?.()};
function deleteEntity(e){const count=data.relationships.filter(r=>r.source===e.id||r.target===e.id).length;confirm("Delete "+e.name+"? "+count+" connected relationship(s) will also be deleted.",()=>{data.entities=data.entities.filter(x=>x.id!==e.id);data.relationships=data.relationships.filter(r=>r.source!==e.id&&r.target!==e.id);if(selected?.id===e.id)selected=null;markDirty();toast("Entity deleted.")})}
function deleteRelationship(r){confirm("Delete "+r.type+" relationship?",()=>{data.relationships=data.relationships.filter(x=>x.id!==r.id);if(selected?.id===r.id)selected=null;markDirty();toast("Relationship deleted.")})}
function relationshipTypePreset(name){return(data.metadata.relationshipTypes||[]).find(t=>t.name===name)||null}
function startRelationshipWizard(existing=null,source=null,target=null){
 const preset=relationshipTypePreset(existing?.type);
 wizard={existingId:existing?.id||null,step:existing?2:source&&target?2:source?1:0,source:source||existing?.source||null,target:target||existing?.target||null,form:existing?{...clone(existing),description:preset?.description||""}:{type:"",note:"",color:"#d4a03c",lineStyle:"solid",direction:"none",description:""}};renderWizard();openDialog("relationshipDialog")
}
function renderWizard(){
 const host=$("relationshipWizard"),s=wizard.step;$("relationshipDialogTitle").textContent=wizard.existingId?"Edit Relationship":"Create Relationship";
 if(s<2){const first=s===0,choices=data.entities.filter(e=>e.id!==(first?null:wizard.source));host.innerHTML='<div class="wizard-step">STEP '+(s+1)+' / 4 · CHOOSE '+(first?"FIRST":"SECOND")+' ENTITY</div><div class="wizard-options">'+choices.map(e=>'<button data-pick="'+e.id+'" class="'+((first?wizard.source:wizard.target)===e.id?"selected":"")+'"><strong>'+esc(e.name)+'</strong><br><span class="muted">'+e.type+'</span></button>').join("")+'</div><div class="wizard-actions"><button class="subtle-button" data-cancel>Cancel</button><button class="primary-button" data-next '+((first?!wizard.source:!wizard.target)?"disabled":"")+'>Continue</button></div>';host.querySelectorAll("[data-pick]").forEach(b=>b.onclick=()=>{if(first)wizard.source=b.dataset.pick;else wizard.target=b.dataset.pick;renderWizard()});host.querySelector("[data-next]").onclick=()=>{wizard.step++;renderWizard()}}
 else if(s===2){const types=[...new Set([...(data.metadata.relationshipTypes||[]).map(t=>t.name),...data.relationships.map(r=>r.type)])];host.innerHTML='<div class="wizard-step">STEP 3 / 4 · RELATIONSHIP TYPE</div><p class="muted">'+esc(entity(wizard.source)?.name)+" → "+esc(entity(wizard.target)?.name)+'</p><label>Type<input id="wType" list="wTypes" maxlength="80" value="'+esc(wizard.form.type)+'" placeholder="ALLY, ENEMY, CONTROLS"></label><datalist id="wTypes">'+types.map(t=>'<option value="'+esc(t)+'">').join("")+'</datalist><div class="wizard-actions"><button class="subtle-button" data-back>Back</button><button class="primary-button" data-next>Continue</button></div>';host.querySelector("[data-back]").onclick=()=>{wizard.step=wizard.source&&wizard.target?1:0;renderWizard()};host.querySelector("[data-next]").onclick=()=>{const chosen=$("wType").value.trim();if(!chosen){toast("Enter a relationship type.");return}if(chosen!==wizard.form.type){const preset=relationshipTypePreset(chosen);if(preset)Object.assign(wizard.form,preset);else{wizard.form.description="";wizard.form.color="#d4a03c";wizard.form.lineStyle="solid";wizard.form.direction="none"}}wizard.form.type=chosen;wizard.step=3;renderWizard()}}
 else{host.innerHTML='<div class="wizard-step">STEP 4 / 4 · RELATIONSHIP DETAILS</div><p class="muted">'+esc(entity(wizard.source)?.name)+" → "+esc(entity(wizard.target)?.name)+'</p><label>Long note · Markdown source</label><div class="markdown-toolbar"><button type="button" data-rel-md="**|**">Bold</button><button type="button" data-rel-md="*|*">Italic</button><button type="button" data-rel-md="## |">Heading</button><button type="button" id="relPreviewToggle">Preview</button></div><textarea id="wNote" rows="4">'+esc(wizard.form.note)+'</textarea><div id="relNotesPreview" class="markdown-preview" hidden></div><div class="dialog-field-grid"><label>Color<input id="wColor" type="color" value="'+esc(wizard.form.color)+'"></label><label>Line style<select id="wLine"><option value="solid">Straight / solid</option><option value="dotted">Dotted</option><option value="dashed">Dashed</option></select></label><label>Arrow direction<select id="wDirection"><option value="none">None</option><option value="towards">Towards</option><option value="from">From</option><option value="mutual">Mutual</option></select></label></div><div class="wizard-actions"><button class="subtle-button" data-back>Back</button><button class="primary-button" id="saveRel">Save Relationship</button></div>';$("wLine").value=wizard.form.lineStyle;$("wDirection").value=wizard.form.direction;const relNote=$("wNote"),relPreview=$("relNotesPreview");relNote.addEventListener("input",()=>{if(!relPreview.hidden)relPreview.innerHTML=md(relNote.value)});host.querySelectorAll("[data-rel-md]").forEach(button=>button.onclick=()=>{const parts=button.dataset.relMd.split("|"),start=relNote.selectionStart,end=relNote.selectionEnd,selected=relNote.value.slice(start,end)||"text";relNote.setRangeText(parts[0]+selected+parts[1],start,end,"select");relNote.focus();relNote.dispatchEvent(new Event("input"))});$("relPreviewToggle").onclick=()=>{relPreview.hidden=!relPreview.hidden;relPreview.innerHTML=md(relNote.value);$("relPreviewToggle").textContent=relPreview.hidden?"Preview":"Edit source"};host.querySelector("[data-back]").onclick=()=>{wizard.form.note=$("wNote").value;wizard.form.color=$("wColor").value;wizard.form.lineStyle=$("wLine").value;wizard.form.direction=$("wDirection").value;wizard.step=2;renderWizard()};$("saveRel").onclick=()=>{const r={id:wizard.existingId||uid("rel"),source:wizard.source,target:wizard.target,type:wizard.form.type,note:$("wNote").value,color:$("wColor").value,lineStyle:$("wLine").value,direction:$("wDirection").value};if(wizard.existingId)Object.assign(rel(wizard.existingId),r);else data.relationships.push(r);closeDialogs();markDirty();setSelection("relationship",r.id);toast("Relationship saved.")}}
 host.querySelector("[data-cancel]")?.addEventListener("click",closeDialogs)
}
function hideContext(){$("contextMenu").hidden=true}
function placeMenu(p){const m=$("contextMenu");m.hidden=false;m.style.left=Math.min(p.x,innerWidth-210)+"px";m.style.top=Math.min(p.y,innerHeight-240)+"px"}
function entityMenu(e,p){$("contextMenu").innerHTML='<button data-a="dossier">Open Dossier</button><button data-a="edit">Edit Entity</button><button data-a="rel">Create Relationship</button>'+(e.type==="Family"||e.type==="Faction"?'<button data-a="special">Open '+(e.type==="Family"?"Family Tree":"Organization Graph")+'</button>':"")+'<button data-a="delete">Delete Entity</button>';placeMenu(p);$("contextMenu").querySelector('[data-a="dossier"]').onclick=()=>{hideContext();setSelection("entity",e.id);openTab("view")};$("contextMenu").querySelector('[data-a="edit"]').onclick=()=>{hideContext();openEntityDialog(e.type,e)};$("contextMenu").querySelector('[data-a="rel"]').onclick=()=>{hideContext();startRelationshipWizard(null,e.id)};$("contextMenu").querySelector('[data-a="delete"]').onclick=()=>{hideContext();deleteEntity(e)};$("contextMenu").querySelector('[data-a="special"]')?.addEventListener("click",()=>{hideContext();openSpecial(e.type==="Family"?"family":"organization",e)})}
function relationMenu(r,p){$("contextMenu").innerHTML='<button data-a="dossier">Open Dossier</button><button data-a="edit">Edit Relationship</button><button data-a="delete">Delete Relationship</button>';placeMenu(p);$("contextMenu").querySelector('[data-a="dossier"]').onclick=()=>{hideContext();setSelection("relationship",r.id);openTab("dossier")};$("contextMenu").querySelector('[data-a="edit"]').onclick=()=>{hideContext();startRelationshipWizard(r)};$("contextMenu").querySelector('[data-a="delete"]').onclick=()=>{hideContext();deleteRelationship(r)}}
function entitySubmenu(p){$("contextMenu").innerHTML='<button disabled>Create entity · choose type</button>'+TYPE_NAMES.map(t=>'<button data-type="'+t+'">'+TYPES[t].glyph+"　"+t+"</button>").join("");placeMenu(p);$("contextMenu").querySelectorAll("[data-type]").forEach(b=>b.onclick=()=>{hideContext();createEntity(b.dataset.type,p.graphPosition)})}
function openSpecial(view,root){capture();activeView=view;selected={kind:"entity",id:root.id};renderGraph();layout("hierarchy",true);focusEntity(root.id);openTab("view");$("dossierWindow").hidden=false}
$("entitySearch").addEventListener("input",()=>{const q=$("entitySearch").value.trim().toLocaleLowerCase();if(!q){$("searchResults").textContent="";return}const matches=data.entities.filter(e=>(e.name+" "+Object.values(e.fields||{}).join(" ")).toLocaleLowerCase().includes(q)).slice(0,6);$("searchResults").textContent=matches.length?matches.map(e=>e.name+" · "+e.type).join(" / "):"No matching entities";});
$("entitySearch").addEventListener("keydown",e=>{if(e.key!=="Enter")return;const q=$("entitySearch").value.trim().toLocaleLowerCase();const match=data.entities.find(x=>(x.name+" "+Object.values(x.fields||{}).join(" ")).toLocaleLowerCase().includes(q));if(match){openTab("view");let n=cy.getElementById(match.id);if(!n.length&&activeView!=="complete"){capture();activeView="complete";renderGraph();n=cy.getElementById(match.id)}if(n.length)n.style("display","element");setSelection("entity",match.id);focusEntity(match.id);$("searchResults").textContent="Focused: "+match.name}else toast("No matching entity found.");});
function savedViews(){return Array.isArray(data.metadata.savedViews)?data.metadata.savedViews:[]}
function refreshSavedViews(){const select=$("savedViews");if(!select)return;select.innerHTML='<option value="">Saved views…</option>'+savedViews().map((v,i)=>'<option value="'+i+'">'+esc(v.name)+'</option>').join("")}
$("saveView").onclick=()=>{const name=prompt("Name this graph view:");if(!name?.trim())return;const view={name:name.trim(),activeView,layout:layoutModes[activeView],zoom:cy.zoom(),pan:cy.pan(),entityTypes:[...document.querySelectorAll("[data-entity-filter]:checked")].map(i=>i.dataset.entityFilter),relationshipTypes:[...document.querySelectorAll("[data-rel-filter]:checked")].map(i=>i.dataset.relFilter),selectedEntityId:selected?.kind==="entity"?selected.id:null,showEntityLabels:$("showEntityLabels").checked,showRelationshipLabels:$("showRelationshipLabels").checked,labelStage};data.metadata.savedViews=savedViews().filter(v=>v.name!==view.name);data.metadata.savedViews.push(view);refreshSavedViews();$("savedViews").value=String(data.metadata.savedViews.length-1);setDirty(true);persistLocal();toast("Graph view saved.")};
$("deleteSavedView").onclick=()=>{const raw=$("savedViews").value;if(raw===""){toast("Select a saved view first.");return}const i=Number(raw);if(!Number.isInteger(i)||!savedViews()[i]){toast("Select a saved view first.");return}data.metadata.savedViews.splice(i,1);refreshSavedViews();setDirty(true);persistLocal();toast("Saved view deleted.")};
$("savedViews").onchange=e=>{const v=savedViews()[Number(e.target.value)];if(!v)return;activeView=v.activeView||"complete";layoutModes[activeView]=v.layout||layoutModes[activeView];selected=v.selectedEntityId&&entity(v.selectedEntityId)?{kind:"entity",id:v.selectedEntityId}:null;$("showEntityLabels").checked=v.showEntityLabels!==false;$("showRelationshipLabels").checked=v.showRelationshipLabels!==false;labelStage=v.labelStage||3;$("labelStages").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.stage)===labelStage)));renderGraph();document.querySelectorAll("[data-entity-filter]").forEach(i=>i.checked=(v.entityTypes||TYPE_NAMES).includes(i.dataset.entityFilter));document.querySelectorAll("[data-rel-filter]").forEach(i=>i.checked=(v.relationshipTypes||[]).includes(i.dataset.relFilter));applyFilters();if(v.zoom&&v.pan)cy.viewport({zoom:v.zoom,pan:v.pan});$("activeViewLabel").textContent=v.name;openTab("view")};
$("familyView").onclick=()=>{activeView="family";selected=null;renderGraph();layout("hierarchy",true)};
$("politicalView").onclick=()=>{activeView="political";selected=null;renderGraph();layout("force",true)};
$("characterView").onclick=()=>{activeView="characters";selected=null;renderGraph();layout("force",true)};
$("organizationView").onclick=()=>{activeView="organization";selected=null;renderGraph();layout("hierarchy",true)};
$("closeDossier").onclick=()=>{$("dossierWindow").hidden=true};
(function makeDossierDraggable(){const head=$("dossierDrag"),win=$("dossierWindow");let drag=null;head.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const r=win.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};head.setPointerCapture(e.pointerId)});head.addEventListener("pointermove",e=>{if(!drag)return;win.style.left=Math.max(4,Math.min(innerWidth-win.offsetWidth,e.clientX-drag.x))+"px";win.style.top=Math.max(4,Math.min(innerHeight-win.offsetHeight,e.clientY-drag.y))+"px";win.style.right="auto";win.style.bottom="auto"});head.addEventListener("pointerup",()=>drag=null);head.addEventListener("pointercancel",()=>drag=null)})();
refreshSavedViews();
$("addEntityType").onclick=()=>{
 const action=(prompt("Entity types: ADD, EDIT or REMOVE","ADD")||"").trim().toUpperCase();if(!action)return;
 if(action==="ADD"){
  const name=prompt("New entity type name (2–32 characters):")?.trim();if(!name)return;
  if(!/^[\p{L}\p{N} _-]{2,32}$/u.test(name)){toast("Use 2–32 letters, numbers, spaces, underscores or hyphens.");return}
  if(TYPES[name]){toast("That entity type already exists.");return}
  const glyph=prompt("Fallback symbol for this type:","✧")?.trim()||"✧";
  const shape=prompt("Geometric shape: ellipse, hexagon, diamond, star, triangle, rectangle, round-rectangle","hexagon")||"hexagon";
  const fields=(prompt("Default fields for this type (comma-separated):","Role, Status")||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,12);
  if(!["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(shape)){toast("Unsupported geometric shape.");return}
  data.metadata.entityTypes=Array.isArray(data.metadata.entityTypes)?data.metadata.entityTypes:[];data.metadata.entityTypes.push({name,glyph,shape,fields});applyEntityTypes(data.metadata);markDirty();toast("Entity type added.");return;
 }
 const name=prompt("Enter the exact entity type name:")?.trim();if(!name||!TYPES[name]){toast("Entity type not found.");return}
 if(action==="REMOVE"){
  if(BUILTIN_TYPES[name]){toast("Built-in entity types cannot be removed.");return}
  if(data.entities.some(e=>e.type===name)){toast("This type is in use. Reassign or delete its entities first.");return}
  data.metadata.entityTypes=(data.metadata.entityTypes||[]).filter(x=>x.name!==name);applyEntityTypes(data.metadata);markDirty();toast("Entity type removed.");return;
 }
 if(action==="EDIT"){
  const glyph=prompt("Fallback symbol:",TYPES[name].glyph)?.trim()||TYPES[name].glyph;
  const shape=prompt("Geometric shape: ellipse, hexagon, diamond, star, triangle, rectangle, round-rectangle",TYPES[name].shape)||TYPES[name].shape;
  const fields=(prompt("Default fields for this type (comma-separated):",TYPES[name].fields.join(", "))||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,12);
  if(!["ellipse","hexagon","diamond","star","triangle","rectangle","round-rectangle"].includes(shape)){toast("Unsupported geometric shape.");return}
  if(BUILTIN_TYPES[name]){data.metadata.entityTypeOverrides={...(data.metadata.entityTypeOverrides||{}),[name]:{glyph,shape,fields}}}
  else{const def=data.metadata.entityTypes.find(x=>x.name===name);if(def)Object.assign(def,{glyph,shape,fields})}
  applyEntityTypes(data.metadata);markDirty();toast("Entity type appearance updated.");return;
 }
 toast("Choose ADD, EDIT or REMOVE.");
};
$("createEntity").onclick=()=>entitySubmenu({x:innerWidth-355,y:95});
$("createRelationship").onclick=()=>{if(data.entities.length<2){toast("Create at least two entities first.");return}startRelationshipWizard()};
$("completeView").onclick=()=>{capture();activeView="complete";renderGraph();layout("force",false)};
$("fitGraph").onclick=()=>cy.fit(cy.elements(),55);$("resetView").onclick=()=>{cy.reset();cy.fit(cy.elements(),55)};
$("forceLayout").onclick=()=>{layout("force");setDirty(true);persistLocal()};$("hierarchyLayout").onclick=()=>{layout("hierarchy");setDirty(true);persistLocal()};$("manualLayout").onclick=()=>{layout("manual",false);cy.nodes().grabify();setDirty(true);persistLocal();toast("Manual positioning enabled.")};
$("zoomIn").onclick=()=>cy.zoom({level:cy.zoom()*1.2,renderedPosition:{x:innerWidth/2,y:innerHeight/2}});$("zoomOut").onclick=()=>cy.zoom({level:cy.zoom()/1.2,renderedPosition:{x:innerWidth/2,y:innerHeight/2}});
$("toggleLegend").onchange=e=>$("legend").hidden=!e.target.checked;$("closeLegend").onclick=()=>{$("legend").hidden=true;$("toggleLegend").checked=false};
$("showEntityLabels").onchange=e=>cy.nodes().style("text-opacity",e.target.checked?1:0);$("showRelationshipLabels").onchange=e=>cy.edges().style("text-opacity",e.target.checked?1:0);
$("labelStages").querySelectorAll("button").forEach(b=>b.onclick=()=>{$("labelStages").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));const n=Number(b.dataset.stage);labelStage=n;cy.nodes().style("font-size",n===2?26:n===3?13:9);cy.edges().style("font-size",n===2?11:n===3?10:7)});
$("exportData").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)+"\n"],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="heartwell-relationships.json";a.click();URL.revokeObjectURL(url);toast("Complete dataset exported.")};
$("importData").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=normalize(JSON.parse(await f.text()));confirm("Import will replace the current working dataset. Continue?",()=>{data=parsed;layoutModes={...layoutModes,...(data.metadata.layoutModes||{})};selected=null;activeView="complete";persistLocal();viewports={complete:null,family:null,organization:null,political:null,characters:null};setDirty(true);renderGraph();renderFilters();renderLegend();openTab("view");toast("Dataset imported.")})}catch(err){toast("Import failed: "+err.message)}e.target.value=""};
$("reloadOfficial").onclick=()=>{const run=async()=>{try{officialData=await fetchOfficial();await clearLocal();data=clone(officialData);layoutModes={complete:"force",family:"hierarchy",organization:"hierarchy",political:"force",characters:"force"};selected=null;viewports={complete:null,family:null,organization:null};setDirty(false);renderGraph();renderFilters();renderLegend();openTab("view");toast("Official data reloaded.")}catch(e){toast(e.message)}};if(dirty)confirm("Reload official data and discard all unexported changes?",run);else run()};

document.addEventListener("click",e=>{if(!e.target.closest("#contextMenu"))hideContext()});document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
cy=cytoscape({container:$("graph"),elements:[],minZoom:.12,maxZoom:3,wheelSensitivity:.22,selectionType:"single",boxSelectionEnabled:false});
cy.container().addEventListener("contextmenu",e=>e.preventDefault());
cy.on("tap","node",e=>setSelection("entity",e.target.id()));cy.on("tap","edge",e=>setSelection("relationship",e.target.id()));
cy.on("dbltap","node",e=>{setSelection("entity",e.target.id());$("dossierWindow").hidden=false;focusEntity(e.target.id())});
cy.on("cxttap","node",e=>entityMenu(entity(e.target.id()),e.renderedPosition));cy.on("cxttap","edge",e=>relationMenu(rel(e.target.id()),e.renderedPosition));
cy.on("cxttap",e=>{if(e.target===cy)entitySubmenu({...e.renderedPosition,graphPosition:e.position})});
cy.on("free","node",e=>{const n=e.target,at=n.renderedPosition(),target=cy.nodes().filter(x=>x.id()!==n.id()&&x.renderedBoundingBox().x1<=at.x&&x.renderedBoundingBox().x2>=at.x&&x.renderedBoundingBox().y1<=at.y&&x.renderedBoundingBox().y2>=at.y).first();const record=entity(n.id());if(record){record.positions=record.positions||{};record.positions[activeView]=n.position();layoutModes[activeView]="manual";data.metadata.layoutModes={...(data.metadata.layoutModes||{}),[activeView]:"manual"};setDirty(true);persistLocal()}if(target.length)startRelationshipWizard(null,n.id(),target.id())});
cy.on("mouseover","node,edge",e=>{const t=$("tooltip");t.textContent=e.target.isNode()?e.target.data("name"):e.target.data("type");t.hidden=false});cy.on("mousemove","node,edge",e=>{$("tooltip").style.left=(e.originalEvent.clientX+12)+"px";$("tooltip").style.top=(e.originalEvent.clientY+12)+"px"});cy.on("mouseout","node,edge",()=>$("tooltip").hidden=true);cy.on("pan zoom",capture);
async function init(){try{officialData=await fetchOfficial();if(!await restoreLocal()){data=clone(officialData);setDirty(false);$("persistenceState").textContent="Autosave enabled · this browser only"}}catch(e){data={schemaVersion:1,metadata:{id:"heartwell-relationships",name:"Heartwell Relationship Map"},entities:[],relationships:[]};officialData=clone(data);await restoreLocal();toast("Official JSON unavailable: "+e.message)}layoutModes={...layoutModes,...(data.metadata.layoutModes||{})};renderGraph();renderFilters();renderLegend();updateCount();refreshSavedViews();$("entityReferenceOptions")?.remove();const dl=document.createElement("datalist");dl.id="entityReferenceOptions";dl.innerHTML=data.entities.map(e=>'<option value="'+esc(e.name)+'">').join("");document.body.append(dl)}
init();