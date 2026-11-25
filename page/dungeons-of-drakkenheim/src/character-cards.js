export function renderParty(DATA, el, attachCrystalFrame){
 var P=document.querySelector('#party');P.innerHTML='';
 for(var i=0;i<5;i++){(function(i){
  var c=DATA.characters[i]||null,card=el('article','pc'+(c?'':' empty'));card.dataset.el=i;
  var tilt=el('div','tilt'),flip=el('div','flip');
  var sub=[c&&c.race,c&&c['class'],c&&c.level?'Lv '+c.level:''].filter(Boolean).join(' · ')||'Rasa · Klasa · Poziom';
  var front=el('div','face front'),fb=el('div','facebtn');
  var pt=el('div','portrait');if(c&&c.portrait){var im=el('img');im.src=c.portrait;im.alt='';pt.append(im)}else pt.append(el('span','',c&&c.name?c.name[0]:'?'));
  var ft=el('button','turn','Rewers');ft.type='button';ft.setAttribute('aria-label','Odwróć kartę, aby poznać historię postaci: '+(c&&c.name||'bohatera'));
  fb.append(pt,el('h3','',c&&c.name||'Bohater drużyny'),el('div','sub',sub),ft);
  front.append(fb);
  var back=el('div','face back');back.setAttribute('aria-hidden','true');
  var sc=el('div','scroll');
  if(c&&c.stats){var u=el('ul','stats');['STR','DEX','CON','INT','WIS','CHA'].forEach(function(k){var li=el('li');li.append(el('b','',k),document.createTextNode(c.stats[k]!=null?c.stats[k]:'–'));u.append(li)});sc.append(u)}
  sc.append(el('p','',c&&c.bio||'Historia postaci nie została jeszcze uzupełniona.'));
  if(c&&c.player)sc.append(el('p','sub','Gracz: '+c.player)); if(c&&c.status)sc.append(el('p','sub','Status: '+c.status));
  var tb=el('button','turn','Wróć na awers');tb.dataset.i='';tb.tabIndex=-1;
  back.append(el('h3','',c&&c.name||'Character name'),sc,tb);
  function t(){var o=card.classList.toggle('turned');back.setAttribute('aria-hidden',!o);front.setAttribute('aria-hidden',o);tb.tabIndex=o?0:-1;fb.tabIndex=o?-1:0}
  ft.onclick=t;tb.onclick=t;
  flip.append(front,back);tilt.append(flip);card.append(tilt);
  card.addEventListener('pointermove',function(e){var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   tilt.style.setProperty('--ry',((x-.5)*14)+'deg');tilt.style.setProperty('--rx',((.5-y)*14)+'deg');
   card.querySelectorAll('.face').forEach(function(f){f.style.setProperty('--mx',x*100+'%');f.style.setProperty('--my',y*100+'%')})});
  card.addEventListener('pointerleave',function(){tilt.style.setProperty('--rx','0deg');tilt.style.setProperty('--ry','0deg')});
  P.append(card);attachCrystalFrame(card)})(i)}
}
