import { loadMapConfiguration } from "./config-loader.js";
import { normalizeCampaignData, createCampaignData } from "./data-schema.js";
import { readJson, writeJson } from "./storage.js";

(async function(){
  const settings = await loadMapConfiguration();
  const mapConfig = settings.map, layerConfig = settings.layers, editorConfig = settings.editor;
var WN=mapConfig.dimensions.width, HN=mapConfig.dimensions.height;
  var Z=mapConfig.projection.baseZoom, S=mapConfig.projection.hexSize, R=S/Math.sqrt(3);
  var CS=1.5*R, KPP=S/48, SC=mapConfig.projection.columnsPerSheet, SR=mapConfig.projection.rowsPerSheet, YS=mapConfig.projection.yScale;
  var LAND=mapConfig.projection.landSheets, POLE=mapConfig.projection.pole;
  var map=L.map('map',{crs:L.CRS.Simple,minZoom:mapConfig.view.minZoom,maxZoom:mapConfig.view.maxZoom,zoomSnap:mapConfig.view.zoomSnap,zoomDelta:mapConfig.view.zoomDelta,wheelPxPerZoomLevel:mapConfig.view.wheelPxPerZoomLevel,attributionControl:false,zoomControl:false});
  var ll=function(px,py){return map.unproject([px,py],Z)};
  var bounds=L.latLngBounds(ll(0,HN),ll(WN,0));
  L.imageOverlay(mapConfig.image,bounds,{interactive:false}).addTo(map);
  var secondMap={width:1400,height:1812,gap:24}, secondMapLeft=WN+secondMap.gap;
  var secondMapBounds=L.latLngBounds(ll(secondMapLeft,secondMap.height),ll(secondMapLeft+secondMap.width,0));
  L.imageOverlay('./map2.webp',secondMapBounds,{interactive:false}).addTo(map);
  var combinedBounds=L.latLngBounds(ll(0,Math.max(HN,secondMap.height)),ll(secondMapLeft+secondMap.width,0));
  map.setMaxBounds(combinedBounds.pad(mapConfig.view.maxBoundsPadding));
  var m=/^#(\\d+(?:\\.\\d+)?)\\/(\\d+)\\/(\\d+)$/.exec(location.hash);
  if(m) map.setView(ll(+m[2],+m[3]),Math.min(Z,+m[1])); else map.fitBounds(bounds);
  map.on('moveend',function(){var p=map.project(map.getCenter(),Z);
    history.replaceState(null,'','#'+map.getZoom()+'/'+Math.round(p.x)+'/'+Math.round(p.y));});

  function hexOf(x,y){
    var q=(2/3)*x/R, r=(-x/3+y/Math.sqrt(3))/R, s=-q-r, rq=Math.round(q), rr=Math.round(r), rs=Math.round(s);
    var dq=Math.abs(rq-q), dr=Math.abs(rr-r), ds=Math.abs(rs-s);
    if(dq>dr&&dq>ds) rq=-rr-rs; else if(dr>ds) rr=-rq-rs;
    return [rq, rr+(rq-(rq&1))/2];
  }
  var sid=function(i,j){return String.fromCharCode(65+i)+(j+1)}, two=function(n){return (n<10?'0':'')+n};
  var read=document.getElementById('read');
  function show(e){
    var p=map.project(e.latlng,Z);
    if(p.x<0||p.y<0||p.x>WN||p.y>HN){read.innerHTML='<small>Poza mapą</small>';return}
    var h=hexOf(p.x*KPP,p.y*KPP);
    if(h[0]<0||h[1]<0){read.innerHTML='<small>Poza mapą</small>';return}
    var i=Math.floor(h[0]/SC), j=Math.floor(h[1]/SR);
    read.innerHTML='Arkusz '+sid(i,j)+' &middot; hex '+two(h[0]%SC+1)+two(h[1]%SR+1);
  }
  map.on('mousemove',show);
  var STORE=mapConfig.storageKey, DATA_URL=mapConfig.dataUrl, layerNames=layerConfig.layerOrder.slice(), regionNameMode=layerConfig.regionNames.defaultMode, pinVisibilityMode=layerConfig.markers.visibility.defaultMode, editingRegionId='', brushMode=editorConfig.brush.defaultMode, regionChooserPurpose='edit';
  var regionData={political:[],geographical:[]}, pinData=[], pinMarkers=L.layerGroup().addTo(map), overlayGroups={}, editMode=false, eraseMode=false, painting=false, lastPainted='', hasLocalDraft=false, hasLocalPins=false, placingPin=false, pendingPinHex='', editingPinId='';
  var PIN_VISIBILITY_STORE=STORE+'-pin-visibility';
  try{var storedPinVisibility=localStorage.getItem(PIN_VISIBILITY_STORE);if(['hidden','hover','click','always'].indexOf(storedPinVisibility)!==-1)pinVisibilityMode=storedPinVisibility;}catch(e){}
  function applyRegionData(data){
    data=normalizeCampaignData(data);
    if(!data||typeof data!=='object'||!Array.isArray(data.political)||!Array.isArray(data.geographical))throw new Error('Plik musi zawierać tablice regionów politycznych i geograficznych.');
    var next={political:[],geographical:[]},nextPins=[];
    layerNames.forEach(function(k){
      var seenIds=Object.create(null),seenNames=Object.create(null);
      data[k].forEach(function(r){
        if(!r||typeof r.id!=='string'||!r.id||typeof r.name!=='string'||!r.name.trim()||!/^#[0-9a-f]{6}$/i.test(r.color)||!Array.isArray(r.hexes))throw new Error('Nieprawidłowy wpis regionu w warstwie '+k+' .');
        var normalized=r.name.trim().replace(/\\s+/g,' ').toLocaleLowerCase();
        if(seenIds[r.id]||seenNames[normalized])throw new Error('Powielony identyfikator lub nazwa regionu w warstwie '+k+' .');
        seenIds[r.id]=true;seenNames[normalized]=true;
        next[k].push({id:r.id,name:r.name.trim(),color:r.color,description:typeof r.description==='string'?r.description:'',fillStyle:['none','tint','hatch'].indexOf(r.fillStyle)!==-1?r.fillStyle:(k==='political'?'hatch':'none'),hexes:r.hexes.filter(function(key){return typeof key==='string'&&!!parseAddress(key);})});
      });
    });
    if(data.pins!==undefined&&!Array.isArray(data.pins))throw new Error('Lista znaczników musi być tablicą.');
    (data.pins||[]).forEach(function(p){if(!p||typeof p.id!=='string'||typeof p.name!=='string'||typeof p.hex!=='string'||!parseAddress(p.hex)||['standard','ruin','settlement','landmark','natural'].indexOf(p.style)===-1)throw new Error('Nieprawidłowy wpis znacznika.');nextPins.push({id:p.id,name:p.name,style:p.style,color:typeof p.color==='string'&&/^#[0-9a-f]{6}$/i.test(p.color)?p.color:defaultPinColor(p.style),description:typeof p.description==='string'?p.description:'',hex:p.hex});});
    regionData=next;pinData=nextPins;
  }
  try{var savedData=readJson(STORE);if(savedData){applyRegionData(savedData);hasLocalPins=savedData.markerEdits===true||savedData.pinsEdited===true||(Array.isArray(savedData.markers)&&savedData.markers.length>0)||(Array.isArray(savedData.pins)&&savedData.pins.length>0);hasLocalDraft=true;}}catch(err){console.warn('Nie udało się wczytać zapisanych danych nakładek',err);}
  layerNames.forEach(function(k){overlayGroups[k]=L.layerGroup();});
  function exportableData(){return createCampaignData(regionData,pinData,hasLocalPins,{id:'odyssey',name:'Odyssey of the Dragonlords',mapId:mapConfig.id});}
  function saveData(){if(writeJson(STORE,exportableData()))hasLocalDraft=true;else setHint('Nie udało się zapisać danych w tej przeglądarce. Pobierz kopię zapasową w formacie JSON.');}
  function setHint(t){}
  function currentLayer(){return document.getElementById('layerSelect').value;}
  function selectedRegion(){var id=document.getElementById('regionSelect').value;return regionData[currentLayer()].find(function(r){return r.id===id;});}
  var editorSelects=[];
  function enhanceEditorSelect(select){
    if(select.dataset.enhancedSelect)return;
    select.dataset.enhancedSelect='true';
    var wrap=document.createElement('div');wrap.className='editor-select';
    select.classList.add('editor-select-native');select.parentNode.insertBefore(wrap,select);wrap.appendChild(select);
    var trigger=document.createElement('button');trigger.type='button';trigger.className='editor-select-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
    var menu=document.createElement('div');menu.className='editor-select-menu';menu.hidden=true;menu.setAttribute('role','listbox');
    var menuId='custom-select-'+(select.id||Math.random().toString(36).slice(2));menu.id=menuId;trigger.setAttribute('aria-controls',menuId);wrap.appendChild(trigger);
    document.body.appendChild(menu);
    var activeIndex=-1;
    function setLabel(){var chosen=select.options[select.selectedIndex];trigger.textContent=chosen?chosen.textContent:'Wybierz…';}
    function position(){
      var rect=trigger.getBoundingClientRect(),gap=5,spaceBelow=window.innerHeight-rect.bottom-gap-8,spaceAbove=rect.top-gap-8;
      var openAbove=spaceBelow<Math.min(220,menu.scrollHeight)&&spaceAbove>spaceBelow;
      var maxH=Math.max(100,Math.min(260,openAbove?spaceAbove:spaceBelow));
      menu.style.maxHeight=maxH+'px';menu.style.overflowY=menu.scrollHeight>maxH?'auto':'hidden';
      menu.style.position='fixed';menu.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-menu.offsetWidth-8))+'px';
      menu.style.width=Math.min(Math.max(rect.width,menu.scrollWidth),window.innerWidth-16)+'px';
      menu.style.top=(openAbove?Math.max(8,rect.top-menu.offsetHeight-gap):Math.min(window.innerHeight-menu.offsetHeight-8,rect.bottom+gap))+'px';
    }
    function close(restore){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();}
    function sync(){
      setLabel();menu.innerHTML='';
      Array.prototype.forEach.call(select.options,function(option,index){
        var item=document.createElement('button');item.type='button';item.className='editor-select-option';item.setAttribute('role','option');item.setAttribute('aria-selected',option.selected?'true':'false');item.textContent=option.textContent;item.disabled=option.disabled;
        item.addEventListener('pointerdown',function(e){e.preventDefault();if(option.disabled)return;select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();close(true);});
        menu.appendChild(item);
      });
      if(!menu.hidden)position();
    }
    function open(){
      editorSelects.forEach(function(item){if(item.select!==select)item.close(false);});
      sync();menu.hidden=false;trigger.setAttribute('aria-expanded','true');position();
      activeIndex=Math.max(0,select.selectedIndex);var items=menu.querySelectorAll('button:not(:disabled)');if(items[activeIndex])items[activeIndex].focus();
    }
    trigger.addEventListener('click',function(){if(menu.hidden)open();else close(false);});
    trigger.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(menu.hidden)open();else move(e.key==='ArrowDown'?1:-1);}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();if(menu.hidden)open();else chooseActive();}
      else if(e.key==='Escape')close(false);
    });
    function move(delta){var items=Array.from(menu.querySelectorAll('button:not(:disabled)'));if(!items.length)return;var i=items.indexOf(document.activeElement);i=Math.max(0,Math.min(items.length-1,i+delta));activeIndex=i;items[i].focus();}
    function chooseActive(){var item=menu.querySelectorAll('button:not(:disabled)')[activeIndex];if(item)item.click();}
    menu.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(e.key==='ArrowDown'?1:-1);}
      else if(e.key==='Home'||e.key==='End'){e.preventDefault();var items=menu.querySelectorAll('button:not(:disabled)');activeIndex=e.key==='Home'?0:items.length-1;if(items[activeIndex])items[activeIndex].focus();}
      else if(e.key==='Escape'){e.preventDefault();close(true);}
      else if(e.key==='Tab')close(false);
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseActive();}
    });
    select.addEventListener('change',sync);
    document.addEventListener('pointerdown',function(e){if(!wrap.contains(e.target)&&!menu.contains(e.target))close(false);});
    window.addEventListener('resize',function(){if(!menu.hidden)position();});
    window.addEventListener('scroll',function(){if(!menu.hidden)position();},true);
    editorSelects.push({select:select,sync:sync,close:close});sync();
  }
  function syncEditorSelect(select){editorSelects.forEach(function(item){if(item.select===select)item.sync();});}
  function refreshRegions(preferred){var sel=document.getElementById('regionSelect'),arr=regionData[currentLayer()];sel.innerHTML='';arr.forEach(function(r){var o=document.createElement('option');o.value=r.id;o.textContent=r.name;sel.appendChild(o);});if(preferred&&arr.some(function(r){return r.id===preferred;}))sel.value=preferred;if(!arr.length){var o=document.createElement('option');o.value='';o.textContent='Brak regionów';sel.appendChild(o);}syncEditorSelect(sel);}
  function addressKey(h){var i=Math.floor(h[0]/SC),j=Math.floor(h[1]/SR);return sid(i,j)+':'+two(h[0]%SC+1)+two(h[1]%SR+1);}
  function parseAddress(key){var m=/^([A-Z])(\d+):(\d{2})(\d{2})$/.exec(key);if(!m)return null;var si=m[1].charCodeAt(0)-65,sj=parseInt(m[2],10)-1,col=parseInt(m[3],10)-1,row=parseInt(m[4],10)-1;if(si<0||sj<0||col<0||col>=SC||row<0||row>=SR)return null;return [si*SC+col,sj*SR+row];}
  function hexVertices(key){var h=parseAddress(key);if(!h)return null;var cx=CS*h[0]/KPP,cy=S*(h[1]+0.5*(h[0]&1))/KPP,pts=[];for(var n=0;n<6;n++){var a=Math.PI*n/3;pts.push([cx+R*Math.cos(a)/KPP,cy+R*Math.sin(a)/KPP]);}return pts;}
  function darker(hex){var n=parseInt(hex.slice(1),16),r=Math.max(0,((n>>16)&255)-65),g=Math.max(0,((n>>8)&255)-65),b=Math.max(0,(n&255)-65);return '#'+[r,g,b].map(function(v){return ('0'+v.toString(16)).slice(-2);}).join('');}
  function hatchHex(pts,color,group){
    var values=pts.map(function(p){return p[0]+p[1];}),min=Math.min.apply(null,values),max=Math.max.apply(null,values),spacing=10;
    for(var c=Math.ceil(min/spacing)*spacing;c<=max;c+=spacing){
      var hits=[];
      for(var i=0;i<6;i++){
        var a=pts[i],b=pts[(i+1)%6],da=a[0]+a[1]-c,db=b[0]+b[1]-c;
        if((da<0&&db>0)||(da>0&&db<0)||Math.abs(da)<0.0001){
          var t=Math.abs(da)<0.0001?0:da/(da-db);
          hits.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
        }
      }
      if(hits.length>=2){
        var a=hits[0],b=hits[1];
        if(Math.hypot(a[0]-b[0],a[1]-b[1])>1)
          L.polyline([ll(a[0],a[1]),ll(b[0],b[1])],{color:color,weight:0.8,opacity:.68,interactive:false,lineCap:'butt',smoothFactor:1,noClip:false}).addTo(group);
      }
    }
  }
  function regionLabel(region,keys,k,group){
    if(!keys.length)return null;
    var centers=keys.map(function(key){var h=parseAddress(key);return {key:key,x:CS*h[0]/KPP,y:S*(h[1]+0.5*(h[0]&1))/KPP};});
    var cx=centers.reduce(function(a,p){return a+p.x;},0)/centers.length,cy=centers.reduce(function(a,p){return a+p.y;},0)/centers.length,best=centers[0],distance=Infinity;
    centers.forEach(function(p){var d=Math.pow(p.x-cx,2)+Math.pow(p.y-cy,2);if(d<distance){distance=d;best=p;}});
    var cls=k==='political'?'map-region-label-political':'map-region-label-geographical';
    var marker=L.marker(ll(best.x,best.y),{interactive:false,keyboard:false,opacity:regionNameMode==='show'?1:0,icon:L.divIcon({className:'map-region-label '+cls,html:'<span>'+escapeHtml(region.name)+'</span>',iconSize:[1,1],iconAnchor:[0,0]})}).addTo(group);
    return marker;
  }
  function renderLayer(k){
    var group=overlayGroups[k];group.clearLayers();
    var edgeOwners=Object.create(null),weight=k==='political'?2.1:4.2,opacity=k==='political'?.88:1;
    regionData[k].forEach(function(region){
      var unique=Array.from(new Set(region.hexes)),valid=[];
      unique.forEach(function(key){
        var pts=hexVertices(key);if(!pts)return;valid.push(key);
        if(region.fillStyle==='tint'){
          L.polygon(pts.map(function(p){return ll(p[0],p[1]);}),{stroke:false,fillColor:region.color,fillOpacity:k==='political'?.09:.16,interactive:false}).addTo(group);
        }else if(region.fillStyle==='hatch'){
          L.polygon(pts.map(function(p){return ll(p[0],p[1]);}),{stroke:false,fillColor:region.color,fillOpacity:.035,interactive:false}).addTo(group);
          hatchHex(pts,region.color,group);
        }
        for(var n=0;n<6;n++){
          var a=pts[n],b=pts[(n+1)%6],ak=a[0].toFixed(2)+','+a[1].toFixed(2),bk=b[0].toFixed(2)+','+b[1].toFixed(2),id=ak<bk?ak+'|'+bk:bk+'|'+ak;
          if(!edgeOwners[id])edgeOwners[id]={a:a,b:b,owners:Object.create(null)};
          edgeOwners[id].owners[region.id]={color:region.color,count:(edgeOwners[id].owners[region.id]?edgeOwners[id].owners[region.id].count:0)+1};
        }
      });
      var nameMarker=regionLabel(region,valid,k,group);
      if(regionNameMode==='hover'&&nameMarker){
        valid.forEach(function(key){var hit=L.polygon(hexVertices(key).map(function(p){return ll(p[0],p[1]);}),{stroke:false,fillColor:'#fff',fillOpacity:0,opacity:0,interactive:true}).addTo(group);
          hit.on('mouseover',function(){nameMarker.setOpacity(1);});
          hit.on('mouseout',function(){nameMarker.setOpacity(0);});
        });
      }
    });
    Object.keys(edgeOwners).forEach(function(id){
      var edge=edgeOwners[id],owners=Object.keys(edge.owners).map(function(key){return edge.owners[key];}).filter(function(owner){return owner.count===1;});
      if(!owners.length)return;
      var a=edge.a,b=edge.b;
      if(owners.length===1){
        L.polyline([ll(a[0],a[1]),ll(b[0],b[1])],{color:owners[0].color,weight:weight,opacity:opacity,interactive:false,lineCap:'butt',lineJoin:'round'}).addTo(group);
        return;
      }
      var pa=map.project(ll(a[0],a[1]),Z),pb=map.project(ll(b[0],b[1]),Z),dx=pb.x-pa.x,dy=pb.y-pa.y,len=Math.hypot(dx,dy)||1,ox=-(dy/len)*1.25,oy=(dx/len)*1.25;
      owners.slice(0,2).forEach(function(owner,index){
        var sign=index===0?1:-1,shift=sign;
        var p1=L.point(pa.x+ox*shift,pa.y+oy*shift),p2=L.point(pb.x+ox*shift,pb.y+oy*shift);
        L.polyline([map.unproject(p1,Z),map.unproject(p2,Z)],{color:owner.color,weight:weight/2+0.5,opacity:opacity,interactive:false,lineCap:'butt',lineJoin:'round'}).addTo(group);
      });
    });
  }
  function renderAll(){layerNames.forEach(renderLayer);}
  function defaultPinColor(style){return {standard:'#f4e5c9',ruin:'#e0a45a',settlement:'#bd8c45',landmark:'#d45a36',natural:'#a96a25'}[style]||'#f4e5c9';}
  function pinIcon(style,color){var glyph={standard:'•',ruin:'✥',settlement:'⌂',landmark:'★',natural:'✿'}[style]||'•',safeColor=/^#[0-9a-f]{6}$/i.test(color||'')?color:defaultPinColor(style);return L.divIcon({className:'',html:'<div class="pin-icon pin-'+style+'" style="--pin-color:'+safeColor+'"><span><b>'+glyph+'</b></span></div>',iconSize:[28,34],iconAnchor:[14,32]});}
  function renderPins(){pinMarkers.clearLayers();if(pinVisibilityMode==='hidden')return;pinData.forEach(function(pin,index){var h=parseAddress(pin.hex);if(!h)return;var point=ll(CS*h[0]/KPP,S*(h[1]+0.5*(h[0]&1))/KPP),marker=L.marker(point,{icon:pinIcon(pin.style,pin.color),title:pin.name}).bindPopup('<span class="popup-title">'+escapeHtml(pin.name)+'</span><span class="popup-description">'+escapeHtml(pin.description).replace(/\\n/g,'<br>')+'</span><span class="popup-reference">'+escapeHtml(pin.hex.replace(':',' · Hex '))+'</span>',{className:'editorial-popup'});if(pinVisibilityMode==='hover'||pinVisibilityMode==='always'){var labelOffset=[((index%3)-1)*12,-25-(Math.floor(index/3)%2)*5];marker.bindTooltip(escapeHtml(pin.name),{permanent:pinVisibilityMode==='always',direction:'top',offset:labelOffset,className:'pin-name-tooltip',opacity:1});}marker.on('click',function(e){if(placingPin)cancelPinPlacement();selectHexAt(e.latlng);}).addTo(pinMarkers);});}
  function cancelPinPlacement(){placingPin=false;pendingPinHex='';document.body.classList.remove('pin-placement-active');}
  function beginPinPlacement(){stopEditing();cancelPinPlacement();placingPin=true;document.body.classList.add('pin-placement-active');document.getElementById('editor').hidden=true;document.getElementById('editorButton').setAttribute('aria-expanded','false');}
  function hexAddressAt(latlng){var p=map.project(latlng,Z);if(p.x<0||p.y<0||p.x>WN||p.y>HN)return null;var h=hexOf(p.x*KPP,p.y*KPP);if(h[0]<0||h[1]<0)return null;var sheet=sid(Math.floor(h[0]/SC),Math.floor(h[1]/SR));if(LAND.indexOf(sheet)<0)return null;return addressKey(h);}
  function closePinContextMenu(){var menu=document.getElementById('pinContextMenu');menu.hidden=true;menu.innerHTML='';menu.dataset.hex='';}
  function copyMapText(value){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).catch(function(){setHint('Nie udało się skopiować do schowka.');});return;}var field=document.createElement('textarea');field.value=value;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();try{document.execCommand('copy');}catch(err){setHint('Nie udało się skopiować do schowka.');}field.remove();}
  function showMapContextMenu(latlng,event){
    var key=hexAddressAt(latlng),menu=document.getElementById('pinContextMenu');
    if(!key){closePinContextMenu();return;}
    var pins=pinData.filter(function(pin){return pin.hex===key;});
    menu.innerHTML='';menu.dataset.hex=key;
    function action(label,handler,extra){var button=document.createElement('button');button.type='button';button.setAttribute('role','menuitem');button.textContent=label;if(extra)button.className=extra;button.addEventListener('click',function(){closePinContextMenu();handler();});menu.appendChild(button);}
    if(pins.length){
      action('Wyświetl kartę znacznika',function(){selectHexAt(latlng);});
      action('Edytuj znacznik',function(){openPinDialog(key,pins[0]);});
      action('Usuń znacznik',function(){var pin=pins[0];pinData=pinData.filter(function(p){return p.id!==pin.id;});hasLocalPins=true;saveData();renderPins();},'delete');
    }else{action('Utwórz znacznik',function(){openPinDialog(key);});}
    var assigned=[];
    layerNames.forEach(function(layer){regionData[layer].forEach(function(region){if(region.hexes.indexOf(key)!==-1)assigned.push({layer:layer,region:region});});});
    if(assigned.length){action('Wybierz region do edytora',function(){if(assigned.length===1)selectRegionInEditor(assigned[0].layer,assigned[0].region);else openRegionChooser(assigned,'select');});action('Edytuj region',function(){if(assigned.length===1)openRegionEditor(assigned[0].layer,assigned[0].region);else openRegionChooser(assigned,'edit');});}
    action('Kopiuj oznaczenie hexu',function(){copyMapText(key);});
    action('Wyśrodkuj mapę w tym miejscu',function(){map.panTo(latlng);});
    menu.hidden=false;
    var width=menu.offsetWidth,height=menu.offsetHeight,x=Math.max(8,Math.min(event.clientX,window.innerWidth-width-8)),y=Math.max(8,Math.min(event.clientY,window.innerHeight-height-8));
    menu.style.left=x+'px';menu.style.top=y+'px';
  }
  function openPinDialog(key,pin){editingPinId=pin?pin.id:'';pendingPinHex=key;var dialog=document.getElementById('pinDialog');document.getElementById('pinDialogTitle').textContent=pin?'Edytuj punkt':'Dodaj punkt';document.getElementById('pinDialogAddress').textContent='Arkusz '+key.replace(':',' · Hex ');document.getElementById('pinName').value=pin?pin.name:'';document.getElementById('pinStyle').value=pin?pin.style:'standard';document.getElementById('pinColor').value=pin?(pin.color||defaultPinColor(pin.style)):defaultPinColor('standard');document.getElementById('pinDescription').value=pin?pin.description:'';updatePinPreview();dialog.hidden=false;dialog.style.display='block';requestAnimationFrame(function(){dialog.style.left='50vw';dialog.style.top='50vh';dialog.style.transform='translate(-50%,-50%)';document.getElementById('pinName').focus();});}
  function closePinDialog(){var dialog=document.getElementById('pinDialog');dialog.hidden=true;dialog.style.display='none';pendingPinHex='';editingPinId='';}
  function brushRadius(){return parseInt(document.getElementById('brushSize').value,10)||0;}
  function brushKeys(center){var q0=center[0],r0=center[1]-(q0-(q0&1))/2,rad=brushRadius(),keys=[];for(var dq=-rad;dq<=rad;dq++){for(var dr=-rad;dr<=rad;dr++){if(Math.max(Math.abs(dq),Math.abs(dr),Math.abs(dq+dr))>rad)continue;var q=q0+dq,ar=r0+dr,row=ar+(q-(q&1))/2;if(q<0||row<0)continue;var si=Math.floor(q/SC),sj=Math.floor(row/SR),sheet=sid(si,sj);if(LAND.indexOf(sheet)<0)continue;keys.push(addressKey([q,row]));}}return keys;}
  function assignBrush(latlng){var p=map.project(latlng,Z);if(p.x<0||p.y<0||p.x>WN||p.y>HN)return;var h=hexOf(p.x*KPP,p.y*KPP);if(h[0]<0||h[1]<0)return;var center=addressKey(h);if(center===lastPainted)return;lastPainted=center;var arr=regionData[currentLayer()],region=selectedRegion();if(!eraseMode&&!region){setHint('Przed malowaniem utwórz region lub wybierz istniejący.');return;}brushKeys(h).forEach(function(key){arr.forEach(function(r){r.hexes=r.hexes.filter(function(x){return x!==key;});});if(!eraseMode&&region.hexes.indexOf(key)===-1)region.hexes.push(key);});saveData();renderLayer(currentLayer());}

  var panelIds=['layersPanel','editor'],buttonIds={layersPanel:'layersButton',editor:'editorButton'};
  function closePanels(){panelIds.forEach(function(id){document.getElementById(id).hidden=true;document.getElementById(buttonIds[id]).setAttribute('aria-expanded','false');});syncBrushActivation();}
  function togglePanel(id){var panel=document.getElementById(id),wasOpen=!panel.hidden;closePanels();if(!wasOpen){panel.hidden=false;document.getElementById(buttonIds[id]).setAttribute('aria-expanded','true');}syncBrushActivation();}
  function activateEditorPanel(){closePanels();var panel=document.getElementById('editor');panel.hidden=false;document.getElementById('editorButton').setAttribute('aria-expanded','true');syncBrushActivation();}
  function selectRegionInEditor(layer,region){if(!region)return;document.getElementById('layerSelect').value=layer;document.getElementById('layerSelect').dispatchEvent(new Event('change',{bubbles:true}));refreshRegions(region.id);syncEditorSelect(document.getElementById('layerSelect'));syncEditorSelect(document.getElementById('regionSelect'));activateEditorPanel();setHint('Wybrano '+region.name+' w edytorze.');}
  Object.keys(buttonIds).forEach(function(id){document.getElementById(buttonIds[id]).addEventListener('click',function(){togglePanel(id);});});
  document.querySelectorAll('[data-close]').forEach(function(button){button.addEventListener('click',function(){var id=this.getAttribute('data-close');document.getElementById(id).hidden=true;if(buttonIds[id])document.getElementById(buttonIds[id]).setAttribute('aria-expanded','false');if(id!=='presenter')syncBrushActivation();});});
  function setOverlayVisibility(key,visible){if(visible){overlayGroups[key].addTo(map);}else{map.removeLayer(overlayGroups[key]);}}
  document.getElementById('politicalLayer').addEventListener('change',function(){setOverlayVisibility('political',this.checked);});
  document.getElementById('geographicalLayer').addEventListener('change',function(){setOverlayVisibility('geographical',this.checked);});
  setOverlayVisibility('political',true);setOverlayVisibility('geographical',true);
  document.querySelectorAll('#regionNameMode button').forEach(function(button){button.addEventListener('click',function(){regionNameMode=this.dataset.mode;document.querySelectorAll('#regionNameMode button').forEach(function(item){item.setAttribute('aria-pressed',item.dataset.mode===regionNameMode?'true':'false');});renderAll();});});
  function setPinVisibilityMode(mode){if(['hidden','hover','click','always'].indexOf(mode)===-1)return;pinVisibilityMode=mode;try{localStorage.setItem(PIN_VISIBILITY_STORE,mode);}catch(e){}document.querySelectorAll('#pinVisibilityMode button').forEach(function(item){item.setAttribute('aria-pressed',item.dataset.mode===mode?'true':'false');});renderPins();}
  document.querySelectorAll('#pinVisibilityMode button').forEach(function(button){button.addEventListener('click',function(){setPinVisibilityMode(this.dataset.mode);});});
  function syncBrushActivation(){var active=!document.getElementById('editor').hidden&&brushMode!=='idle';editMode=active;eraseMode=active&&brushMode==='erase';if(!active){painting=false;lastPainted='';}map.dragging[active?'disable':'enable']();}
  function setBrushMode(mode,announce){brushMode=mode;painting=false;lastPainted='';syncBrushActivation();document.querySelectorAll('#brushModeControl button').forEach(function(button){button.setAttribute('aria-pressed',button.dataset.mode===mode?'true':'false');});if(announce!==false){setHint(mode==='paint'?'Wybrano tryb malowania. Malowanie działa tylko wtedy, gdy panel edytora jest otwarty.':mode==='erase'?'Wybrano tryb wymazywania. Wymazywanie działa tylko wtedy, gdy panel edytora jest otwarty.':'Pędzel jest nieaktywny. Przesuwanie mapy jest ponownie dostępne.');}}
  function stopEditing(){setBrushMode('idle',false);}
  function updateBrushLabel(){var r=brushRadius(),count=1+3*r*(r+1);document.getElementById('brushSizeValue').textContent=r===0?'1 hex':'promień '+r+' ('+count+' hexów)';}
  document.getElementById('brushSize').addEventListener('input',updateBrushLabel);
  document.getElementById('placePinButton').addEventListener('click',beginPinPlacement);
  document.getElementById('cancelPin').addEventListener('click',function(){closePinDialog();cancelPinPlacement();});
  document.addEventListener('click',function(e){if(!e.target.closest||!e.target.closest('#pinContextMenu'))closePinContextMenu();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closePinContextMenu();closeRegionDialogs();}});
  window.addEventListener('resize',closePinContextMenu);
  function updatePinPreview(){var style=document.getElementById('pinStyle').value,color=document.getElementById('pinColor').value,preview=document.getElementById('pinStylePreview'),glyph={standard:'•',ruin:'✥',settlement:'⌂',landmark:'★',natural:'✿'}[style]||'•';preview.innerHTML='<div class="pin-icon pin-'+style+'" style="--pin-color:'+color+'"><span><b>'+glyph+'</b></span></div>';document.getElementById('pinColorPreview').style.background=color;}
  document.getElementById('pinStyle').addEventListener('change',updatePinPreview);
  document.getElementById('pinColor').addEventListener('input',updatePinPreview);
  document.getElementById('pinForm').addEventListener('submit',function(e){e.preventDefault();if(!pendingPinHex)return;var name=document.getElementById('pinName').value.trim();if(!name){document.getElementById('pinName').focus();return;}var updated={id:editingPinId||('p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),name:name,style:document.getElementById('pinStyle').value,color:document.getElementById('pinColor').value,description:document.getElementById('pinDescription').value.trim(),hex:pendingPinHex};if(editingPinId){var index=pinData.findIndex(function(p){return p.id===editingPinId;});if(index!==-1)pinData[index]=updated;else pinData.push(updated);}else pinData.push(updated);hasLocalPins=true;saveData();renderPins();closePinDialog();cancelPinPlacement();});
  document.getElementById('layerSelect').addEventListener('change',function(){painting=false;lastPainted='';refreshRegions();setHint('Zmieniono warstwę. Ustawienie pędzla pozostaje bez zmian; malowanie wymaga otwartego panelu edytora i wybranego regionu.');});
  function closeRegionDialogs(){document.getElementById('regionCreateDialog').hidden=true;document.getElementById('regionDeleteDialog').hidden=true;document.getElementById('regionChooseDialog').hidden=true;editingRegionId='';document.getElementById('newRegionLayer').disabled=false;}
  document.querySelectorAll('[data-close-region-dialog]').forEach(function(button){button.addEventListener('click',closeRegionDialogs);});
  function openRegionEditor(layer,region){editingRegionId=region?region.id:'';document.getElementById('regionCreateTitle').textContent=region?'Edytuj region':'Utwórz region';document.getElementById('saveRegionButton').textContent=region?'Zapisz zmiany':'Utwórz region';document.getElementById('newRegionLayer').value=layer||currentLayer();document.getElementById('newRegionLayer').disabled=!!region;document.getElementById('newRegionName').value=region?region.name:'';document.getElementById('newRegionColor').value=region?region.color:'#9a5d28';document.getElementById('newRegionDescription').value=region?(region.description||''):'';var style=region?(region.fillStyle||'none'):(layer==='political'?'hatch':'none');document.querySelector('input[name="newRegionFill"][value="'+style+'"]').checked=true;updateNewRegionPreview();document.getElementById('regionCreateDialog').hidden=false;document.getElementById('newRegionName').focus();}
  document.getElementById('createRegion').addEventListener('click',function(){openRegionEditor(currentLayer(),null);});
  function openRegionChooser(candidates,purpose){
    regionChooserPurpose=purpose||'edit';var list=document.getElementById('editRegionList');list.innerHTML='';document.getElementById('chooseRegionNext').disabled=true;document.getElementById('editRegionEmpty').hidden=candidates.length!==0;
    candidates.forEach(function(entry,index){var region=entry.region,layer=entry.layer,label=document.createElement('label');label.className='delete-region-option';var radio=document.createElement('input');radio.type='radio';radio.name='editRegionChoice';radio.value=layer+'|'+region.id;var swatch=document.createElement('span');swatch.className='delete-region-swatch';swatch.style.background=region.color;var details=document.createElement('span'),name=document.createElement('span');name.className='delete-region-name';name.textContent=region.name;var meta=document.createElement('div');meta.className='delete-region-meta';meta.textContent=layer==='political'?'Polityczna':'Geograficzna';var visual=document.createElement('div');visual.className='delete-region-visual';var preview=document.createElement('span');preview.className='delete-region-preview style-'+(region.fillStyle||'none');preview.style.setProperty('--region-color',region.color);preview.style.setProperty('--region-fill',region.fillStyle==='tint'?'color-mix(in srgb,'+region.color+' 22%,transparent)':'transparent');var styleName=document.createElement('span');styleName.className='delete-region-style-name';styleName.textContent=region.fillStyle==='hatch'?'Wypełnienie kreskowaniem':region.fillStyle==='tint'?'Delikatne wypełnienie':'Tylko obramowanie';visual.appendChild(preview);visual.appendChild(styleName);var desc=document.createElement('div');desc.className='delete-region-description';desc.textContent=region.description||'Nie podano opisu.';details.appendChild(name);details.appendChild(meta);details.appendChild(visual);details.appendChild(desc);label.appendChild(radio);label.appendChild(swatch);label.appendChild(details);radio.addEventListener('change',function(){list.querySelectorAll('.delete-region-option').forEach(function(item){item.classList.remove('selected');});label.classList.add('selected');document.getElementById('chooseRegionNext').disabled=false;});list.appendChild(label);});
    document.getElementById('regionChooseDialog').hidden=false;
  }
  document.getElementById('chooseRegionNext').addEventListener('click',function(){var choice=document.querySelector('input[name="editRegionChoice"]:checked');if(!choice)return;var parts=choice.value.split('|'),layer=parts[0],region=regionData[layer].find(function(item){return item.id===parts[1];});if(!region)return;document.getElementById('regionChooseDialog').hidden=true;if(regionChooserPurpose==='select')selectRegionInEditor(layer,region);else openRegionEditor(layer,region);});
  document.getElementById('cancelChooseRegion').addEventListener('click',function(){document.getElementById('regionChooseDialog').hidden=true;});
  document.getElementById('editRegion').addEventListener('click',function(){var candidates=[];layerNames.forEach(function(layer){regionData[layer].forEach(function(region){candidates.push({layer:layer,region:region});});});openRegionChooser(candidates);});
  function updateNewRegionPreview(){var color=document.getElementById('newRegionColor').value,preview=document.getElementById('newRegionColorPreview');preview.style.borderColor=color;preview.style.background='linear-gradient('+color+'22,'+color+'22),'+color+'18';document.querySelectorAll('.region-style-preview').forEach(function(sample){sample.style.borderColor=color;sample.style.background=sample.classList.contains('style-hatch')?'repeating-linear-gradient(135deg,'+color+' 0 2px,transparent 2px 6px)':sample.classList.contains('style-tint')?color+'35':'transparent';});}
  document.getElementById('newRegionColor').addEventListener('input',updateNewRegionPreview);
  document.querySelectorAll('input[name="newRegionFill"]').forEach(function(input){input.addEventListener('change',updateNewRegionPreview);});
  document.getElementById('regionCreateForm').addEventListener('submit',function(e){e.preventDefault();var layer=document.getElementById('newRegionLayer').value,name=document.getElementById('newRegionName').value.trim().replace(/\\s+/g,' '),normalized=name.toLocaleLowerCase();if(!name)return;var duplicate=regionData[layer].some(function(r){return r.id!==editingRegionId&&r.name.trim().replace(/\\s+/g,' ').toLocaleLowerCase()===normalized;});if(duplicate){setHint('Region o tej nazwie już istnieje w warstwie '+layer+' .');document.getElementById('newRegionName').focus();return;}var existing=editingRegionId?regionData[layer].find(function(r){return r.id===editingRegionId;}):null;var region={id:editingRegionId||('r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),name:name,color:document.getElementById('newRegionColor').value,description:document.getElementById('newRegionDescription').value.trim(),fillStyle:document.querySelector('input[name="newRegionFill"]:checked').value,hexes:existing?existing.hexes:[]};if(existing){var idx=regionData[layer].findIndex(function(r){return r.id===editingRegionId;});regionData[layer][idx]=region;}else regionData[layer].push(region);if(currentLayer()!==layer){document.getElementById('layerSelect').value=layer;document.getElementById('layerSelect').dispatchEvent(new Event('change',{bubbles:true}));}refreshRegions(region.id);saveData();renderLayer(layer);closeRegionDialogs();editingRegionId='';document.getElementById('newRegionLayer').disabled=false;setHint((existing?'Zaktualizowano ':'Utworzono ')+name+'.');});
  function refreshDeleteRegionOptions(){var layer=document.getElementById('deleteRegionLayer').value,list=document.getElementById('deleteRegionList'),regions=regionData[layer];list.innerHTML='';document.getElementById('deleteRegionEmpty').hidden=regions.length!==0;document.getElementById('confirmDeleteRegion').disabled=true;regions.forEach(function(region,index){var label=document.createElement('label');label.className='delete-region-option';var radio=document.createElement('input');radio.type='radio';radio.name='deleteRegionChoice';radio.value=region.id;var swatch=document.createElement('span');swatch.className='delete-region-swatch';swatch.style.background=region.color;var details=document.createElement('span');var name=document.createElement('span');name.className='delete-region-name';name.textContent=region.name;var meta=document.createElement('div');meta.className='delete-region-meta';meta.textContent=layer==='political'?'Polityczna':'Geograficzna';var visual=document.createElement('div');visual.className='delete-region-visual';var preview=document.createElement('span');preview.className='delete-region-preview style-'+(region.fillStyle||'none');preview.style.setProperty('--region-color',region.color);if(region.fillStyle==='tint')preview.style.setProperty('--region-fill','color-mix(in srgb,'+region.color+' 22%,transparent)');else preview.style.setProperty('--region-fill','transparent');var styleName=document.createElement('span');styleName.className='delete-region-style-name';styleName.textContent=region.fillStyle==='hatch'?'Wypełnienie kreskowaniem':region.fillStyle==='tint'?'Delikatne wypełnienie':'Tylko obramowanie';visual.appendChild(preview);visual.appendChild(styleName);var desc=document.createElement('div');desc.className='delete-region-description';desc.textContent=region.description||'Nie podano opisu.';details.appendChild(name);details.appendChild(meta);details.appendChild(visual);details.appendChild(desc);label.appendChild(radio);label.appendChild(swatch);label.appendChild(details);radio.addEventListener('change',function(){list.querySelectorAll('.delete-region-option').forEach(function(item){item.classList.remove('selected');});label.classList.add('selected');document.getElementById('confirmDeleteRegion').disabled=false;});list.appendChild(label);});}
  document.getElementById('deleteRegion').addEventListener('click',function(){document.getElementById('deleteRegionLayer').value=currentLayer();refreshDeleteRegionOptions();document.getElementById('regionDeleteDialog').hidden=false;});
  document.getElementById('deleteRegionLayer').addEventListener('change',refreshDeleteRegionOptions);
  document.getElementById('confirmDeleteRegion').addEventListener('click',function(){var layer=document.getElementById('deleteRegionLayer').value,choice=document.querySelector('input[name="deleteRegionChoice"]:checked');if(!choice)return;var region=regionData[layer].find(function(r){return r.id===choice.value;});if(!region)return;regionData[layer]=regionData[layer].filter(function(r){return r.id!==region.id;});if(currentLayer()===layer){if(document.getElementById('regionSelect').value===region.id){stopEditing();refreshRegions();}else refreshRegions(document.getElementById('regionSelect').value);}renderLayer(layer);saveData();closeRegionDialogs();setHint('Usunięto region '+region.name+'.');});
  document.querySelectorAll('#brushModeControl button').forEach(function(button){button.addEventListener('click',function(){setBrushMode(this.dataset.mode);});});
  document.getElementById('reloadData').addEventListener('click',function(){
    var button=this,original=button.textContent;button.disabled=true;button.textContent='Ładowanie...';
    fetch(DATA_URL,{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(function(shared){
      applyRegionData(shared);hasLocalDraft=true;hasLocalPins=true;saveData();stopEditing();renderAll();refreshRegions();renderPins();
      setHint('Wczytano aktualne dane regionów i znaczników z GitHuba. Lokalne zmiany zostały zastąpione.');
    }).catch(function(err){console.error('Nie udało się ponownie wczytać danych z GitHuba:',err);setHint('Nie udało się wczytać danych z GitHuba: '+(err&&err.message?err.message:'błąd sieciowy'));}).finally(function(){button.disabled=false;button.textContent=original;});
  });
  document.getElementById('exportData').addEventListener('click',function(){var blob=new Blob([JSON.stringify(exportableData(),null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='odyssey-mapa.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);setHint('Pobrano pełne dane regionów i znaczników w pliku regions.json.');});
  document.getElementById('importData').addEventListener('change',function(e){var file=e.target.files&&e.target.files[0];if(!file)return;var reader=new FileReader();reader.onerror=function(){setHint('Nie udało się odczytać wybranego pliku JSON.');e.target.value='';};reader.onload=function(){try{var data=JSON.parse(String(reader.result).replace(/^\\uFEFF/,''));applyRegionData(data);hasLocalDraft=true;hasLocalPins=true;saveData();stopEditing();refreshRegions();renderAll();renderPins();document.getElementById('regionName').value='';document.getElementById('regionColor').value='#9a5d28';setHint('Zaimportowano '+regionData.political.length+' Polityczna regions, '+regionData.geographical.length+' Geograficzna regions, and '+pinData.length+' pins. Zaimportowano data now replaces the current map data in this browser.');}catch(err){console.error('Import nakładek nie powiódł się:',err);setHint('Import nie powiódł się: '+(err&&err.message?err.message:'nieprawidłowy JSON'));}finally{e.target.value='';}};reader.readAsText(file);});
  map.on('mousedown',function(e){if(!editMode||document.getElementById('editor').hidden)return;painting=true;lastPainted='';assignBrush(e.latlng);});
  map.on('mousemove',function(e){if(painting&&editMode&&!document.getElementById('editor').hidden)assignBrush(e.latlng);});
  function endStroke(){painting=false;lastPainted='';}
  map.on('mouseup',endStroke);
  window.addEventListener('mouseup',endStroke);
  function presentHex(latlng){var p=map.project(latlng,Z);if(p.x<0||p.y<0||p.x>WN||p.y>HN)return;var h=hexOf(p.x*KPP,p.y*KPP);if(h[0]<0||h[1]<0)return;var i=Math.floor(h[0]/SC),j=Math.floor(h[1]/SR),sheet=sid(i,j),hex=two(h[0]%SC+1)+two(h[1]%SR+1),key=sheet+':'+hex;document.getElementById('presenterAddress').textContent=sheet+' / '+hex;document.getElementById('presenterSub').textContent='Thylea · Karta pola';document.getElementById('presenterIntro').textContent='Zapisane informacje o tym hexie.';var html='';layerNames.forEach(function(k){var found=null;regionData[k].some(function(r){if(r.hexes.indexOf(key)!==-1){found=r;return true;}return false;});html+='<div class="present-row"><div class="present-label">'+(k==='political'?'Polityczna territory':'Geograficzna region')+'</div>';html+=found?'<div class="present-value"><span class="present-swatch" style="background:'+found.color+'"></span>'+escapeHtml(found.name)+'</div>':'<div class="present-empty">Brak zapisanych informacji</div>';html+='</div>';});var places=pinData.filter(function(pin){return pin.hex===key;});if(places.length){html+='<div class="present-row"><div class="present-label">Punkty zainteresowania</div>'+places.map(function(x){return '<div class="present-value">'+escapeHtml(x.name)+'</div><div class="present-empty">'+escapeHtml(x.description)+'</div>';}).join('')+'</div>';}document.getElementById('presenterDetails').innerHTML=html;}
  function escapeHtml(s){return String(s).replace(/[&<>\"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch];});}

  function selectHexAt(latlng){var event={latlng:latlng};show(event);presentHex(latlng);document.getElementById('presenter').hidden=false;}
  map.on('contextmenu',function(e){L.DomEvent.preventDefault(e);L.DomEvent.stopPropagation(e);if(placingPin)return;showMapContextMenu(e.latlng,e.originalEvent);});
  map.on('click',function(e){closePinContextMenu();if(placingPin){var key=hexAddressAt(e.latlng);if(!key){cancelPinPlacement();return;}cancelPinPlacement();openPinDialog(key);return;}if(!document.getElementById('editor').hidden){show(e);presentHex(e.latlng);document.getElementById('presenter').hidden=false;return;}selectHexAt(e.latlng);});
  document.addEventListener('click',function(e){
    if(!placingPin)return;
    var target=e.target;
    if(target.closest&&target.closest('#placePinButton'))return;
    if(target.closest&&target.closest('#pinDialog'))return;
    var mapContainer=target.closest&&target.closest('#map');
    if(mapContainer&&e.button===0){
      var latlng=map.mouseEventToLatLng(e),key=hexAddressAt(latlng);
      if(key){
        e.preventDefault();e.stopPropagation();
        cancelPinPlacement();openPinDialog(key);
        return;
      }
      cancelPinPlacement();
      return;
    }
    cancelPinPlacement();
  },true);
  fetch(DATA_URL,{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(function(shared){if(!hasLocalDraft){applyRegionData(shared);hasLocalPins=true;renderAll();refreshRegions();renderPins();}else if(!hasLocalPins){pinData=normalizeCampaignData(shared).pins;hasLocalPins=true;saveData();renderPins();}}).catch(function(err){console.warn('Nie udało się wczytać udostępnionych danych regionów',err);if(!hasLocalDraft)setHint('Nie udało się wczytać udostępnionych danych regionów.');});
  ['layerSelect','regionSelect','newRegionLayer','deleteRegionLayer','pinStyle'].forEach(function(id){enhanceEditorSelect(document.getElementById(id));});
  renderAll();refreshRegions();updateBrushLabel();

  L.control.zoom({position:'bottomright'}).addTo(map);
  L.control.scale({imperial:false,metric:false,position:'bottomright'}).addTo(map);
})().catch(function(error){
  console.error('Nie udało się uruchomić mapy kampanii:', error);
  var notice=document.createElement('div');
  notice.style.cssText='position:fixed;z-index:999999;left:16px;right:16px;bottom:16px;padding:12px 14px;background:#260c10;color:#f5e8d2;border:1px solid #f0b64a;border-radius:4px;font:14px/1.45 system-ui,sans-serif';
  notice.textContent='Nie udało się uruchomić mapy. Odśwież stronę lub sprawdź połączenie. Szczegóły są dostępne w konsoli przeglądarki.';
  document.body.appendChild(notice);
});
