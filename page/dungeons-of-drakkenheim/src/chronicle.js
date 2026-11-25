export function renderChron(DATA, el, attachChronicleCrystals){
 var L=document.querySelector('#chron');L.innerHTML='';
 DATA.chronicle.forEach(function(e,i){
  var li=el('li','ev'),sl=el('button','seal');var crystal=el('img');crystal.src='/page/dungeons-of-drakkenheim/res/graphics/brylka.webp';crystal.alt='';crystal.draggable=false;sl.append(crystal,el('span','seal-number',String(e.sessionNumber||i+1)));sl.dataset.i='';sl.setAttribute('aria-expanded','false');sl.setAttribute('aria-controls','d'+i);sl.setAttribute('aria-label','Rozwiń szczegóły: '+e.title);
  var sh=el('div','sheet');sh.append(el('div','date','ODCINEK '+String(e.sessionNumber||i+1).padStart(2,'0')),el('h3','',e.title),el('p','sumtxt',e.summary||''));
  var d=el('div','detail'),w=el('div');if(e.notes)w.append(el('p','session-notes',e.notes));
  (e.recordings||[]).forEach(function(rec){var a=el('a','recording-link',rec.label||'Oglądaj na YouTube');a.href=rec.url;a.target='_blank';a.rel='noopener noreferrer';w.append(a)});
  d.append(w);sh.append(d,el('div','cue'));
  function toggleEntry(){
   var open=li.classList.toggle('open');
   sl.setAttribute('aria-expanded',String(open));
   sl.setAttribute('aria-label',(open?'Zwiń':'Rozwiń')+' szczegóły: '+e.title);
  }
  sl.onclick=toggleEntry;
  sh.onclick=function(ev){
   if(ev.target.closest('a'))return;
   toggleEntry();
  };
  sh.dataset.i='';
  li.append(sl,sh);L.append(li);attachChronicleCrystals(li,sh,el)
 })
}
