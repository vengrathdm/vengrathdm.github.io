import { el } from './dom.js';
export function initScreenCrystalFrame(){
{
 var frame=el('div');frame.id='screen-crystals';frame.setAttribute('aria-hidden','true');document.body.append(frame);
 var edges={top:[],bottom:[],left:[],right:[]};
 function add(edge,distance){
  var im=el('img');im.src='/page/dungeons-of-drakkenheim/res/graphics/brylka.webp';im.alt='';im.draggable=false;
  im.style.setProperty('--crystal-size',(155*(.9+Math.random()*.2))+'px');
  im.style.setProperty('--crystal-rotation',(Math.random()*360)+'deg');
  im.style.setProperty('--crystal-flip-x',Math.random()<.5?-1:1);
  im.style.setProperty('--crystal-flip-y',Math.random()<.5?-1:1);
  var inward={top:[0,28],bottom:[0,-28],left:[28,0],right:[-28,0]}[edge];
  im.style.setProperty('--crystal-enter-x',inward[0]+'px');im.style.setProperty('--crystal-enter-y',inward[1]+'px');
  im.dataset.distance=distance;im.classList.add('crystal-entering');frame.append(im);edges[edge].push(im);
  requestAnimationFrame(function(){im.classList.remove('crystal-entering')});
 }
 function sync(){
  var w=document.documentElement.clientWidth,h=window.innerHeight;
  ['top','bottom'].forEach(function(edge){
   var nodes=edges[edge],last=nodes.length?Number(nodes[nodes.length-1].dataset.distance):0;
   if(!nodes.length)add(edge,0);
   while(last<w-12){last+=35+Math.random()*20;add(edge,last)}
   nodes.forEach(function(im){im.style.left=Math.min(Number(im.dataset.distance),w)+'px';im.style.top=(edge==='top'?0:h)+'px'});
  });
  ['left','right'].forEach(function(edge){
   var nodes=edges[edge],last=nodes.length?Number(nodes[nodes.length-1].dataset.distance):0;
   if(!nodes.length)add(edge,0);
   while(last<h-12){last+=35+Math.random()*20;add(edge,last)}
   nodes.forEach(function(im){im.style.top=Math.min(Number(im.dataset.distance),h)+'px';im.style.left=(edge==='left'?0:w)+'px'});
  });
 }
 sync();addEventListener('resize',sync,{passive:true});

}

export function attachCrystalFrame(target){
 if(!target)return;
 var old=target.querySelector(':scope > .crystal-frame-layer');if(old)old.remove();
 if(target._crystalFrameObserver)target._crystalFrameObserver.disconnect();
 var layer=el('div','crystal-frame-layer');layer.setAttribute('aria-hidden','true');target.append(layer);
 var edges={top:[],bottom:[],left:[],right:[]};
 function add(edge,distance){
  var im=el('img');im.src='/page/dungeons-of-drakkenheim/res/graphics/brylka.webp';im.alt='';im.draggable=false;
  im.style.setProperty('--crystal-size',(155*(.9+Math.random()*.2))+'px');
  im.style.setProperty('--crystal-rotation',(Math.random()*360)+'deg');
  im.style.setProperty('--crystal-flip-x',Math.random()<.5?-1:1);
  im.style.setProperty('--crystal-flip-y',Math.random()<.5?-1:1);
  var inward={top:[0,30],bottom:[0,-30],left:[30,0],right:[-30,0]}[edge];
  im.style.setProperty('--crystal-enter-x',inward[0]+'px');im.style.setProperty('--crystal-enter-y',inward[1]+'px');
  im.style.setProperty('--crystal-hide-x',inward[0]+'px');im.style.setProperty('--crystal-hide-y',inward[1]+'px');
  im.dataset.distance=distance;im.dataset.edge=edge;im.classList.add('crystal-frame-entering');
  im.addEventListener('transitionend',function(ev){if(ev.propertyName==='opacity'&&im.classList.contains('crystal-frame-retiring'))im.hidden=true});
  layer.append(im);edges[edge].push(im);
  requestAnimationFrame(function(){im.classList.remove('crystal-frame-entering')});
 }
 function fill(edge,length){
  var nodes=edges[edge],last=nodes.length?Number(nodes[nodes.length-1].dataset.distance):0;
  if(!nodes.length)add(edge,0);
  while(last<length-8){last+=17.5+Math.random()*10;add(edge,last)}
  nodes.forEach(function(im){
   var outside=Number(im.dataset.distance)>length+12;
   if(outside){if(!im.hidden)im.classList.add('crystal-frame-retiring')}
   else{im.hidden=false;im.classList.remove('crystal-frame-retiring')}
  });
 }
 function sync(){
  if(!target.isConnected)return;
  var w=target.clientWidth,h=target.clientHeight;
  ['top','bottom'].forEach(function(edge){fill(edge,w)});
  ['left','right'].forEach(function(edge){fill(edge,h)});
  Object.keys(edges).forEach(function(edge){edges[edge].forEach(function(im){
   var d=Number(im.dataset.distance);
   if(edge==='top'){im.style.left=d+'px';im.style.top='0px'}
   else if(edge==='bottom'){im.style.left=d+'px';im.style.top=h+'px'}
   else if(edge==='left'){im.style.left='0px';im.style.top=d+'px'}
   else{im.style.left=w+'px';im.style.top=d+'px'}
  })});
 }
 sync();
 if(window.ResizeObserver){target._crystalFrameObserver=new ResizeObserver(sync);target._crystalFrameObserver.observe(target)}
 addEventListener('resize',sync,{passive:true});
}

export function attachChronicleCrystals(li,sh,el){
  var old=li.querySelector('.crystal-growth');if(old)old.remove();
  if(li._crystalObserver)li._crystalObserver.disconnect();
  var growth=el('div','crystal-growth');growth.setAttribute('aria-hidden','true');
  var edges={top:[],bottom:[],left:[],right:[]};
  function add(edge,distance){
   var im=el('img');im.src='/page/dungeons-of-drakkenheim/res/graphics/brylka.webp';im.alt='';im.draggable=false;
   var size=155*(.9+Math.random()*.2);
   im.style.setProperty('--crystal-size',size+'px');
   im.style.setProperty('--crystal-rotation',(Math.random()*360)+'deg');
   im.style.setProperty('--crystal-flip-x',Math.random()<.5?-1:1);
   im.style.setProperty('--crystal-flip-y',Math.random()<.5?-1:1);
   var inward={top:[0,30],bottom:[0,-30],left:[30,0],right:[-30,0]}[edge];
   im.style.setProperty('--crystal-hide-x',inward[0]+'px');
   im.style.setProperty('--crystal-hide-y',inward[1]+'px');
   im.dataset.distance=distance;im.dataset.edge=edge;
   im.hidden=false;im.classList.add('crystal-retiring');
   im.addEventListener('transitionend',function(ev){if(ev.propertyName==='opacity'&&im.classList.contains('crystal-retiring'))im.hidden=true});
   growth.append(im);edges[edge].push(im);
   requestAnimationFrame(function(){im.classList.remove('crystal-retiring')});
  }
  function fill(edge,length){
   var nodes=edges[edge],last=nodes.length?Number(nodes[nodes.length-1].dataset.distance):0;
   if(!nodes.length)add(edge,0);
   while(last<length-12){last+=35+Math.random()*20;add(edge,last)}
   nodes.forEach(function(im){
    var outside=Number(im.dataset.distance)>length+12;
    if(outside){if(!im.hidden)im.classList.add('crystal-retiring')}
    else{im.hidden=false;im.classList.remove('crystal-retiring')}
   });
  }
  function sync(){
   if(!sh.isConnected)return;
   var paper=sh.getBoundingClientRect(),parent=li.getBoundingClientRect();
   var sx=paper.left-parent.left,sy=paper.top-parent.top,sw=paper.width,shh=paper.height;
   ['top','bottom'].forEach(function(edge){fill(edge,sw)});
   ['left','right'].forEach(function(edge){fill(edge,shh)});
   Object.keys(edges).forEach(function(edge){
    edges[edge].forEach(function(im){
     var d=Number(im.dataset.distance);
     if(edge==='top'){im.style.left=(sx+d)+'px';im.style.top=sy+'px'}
     else if(edge==='bottom'){im.style.left=(sx+d)+'px';im.style.top=(sy+shh)+'px'}
     else if(edge==='left'){im.style.left=sx+'px';im.style.top=(sy+d)+'px'}
     else{im.style.left=(sx+sw)+'px';im.style.top=(sy+d)+'px'}
    });
   });
  }
  li.insertBefore(growth,sh);sync();
  if(window.ResizeObserver){li._crystalObserver=new ResizeObserver(sync);li._crystalObserver.observe(sh,{box:'border-box'})}
 }
