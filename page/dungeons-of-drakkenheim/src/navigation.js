export function initNavigation(){
/* embers */
(function(){var c=document.querySelector('#embers'),x=c.getContext('2d'),P=[],W,H;
 function rs(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;P.forEach(function(p){p.x=Math.random()*W;p.y=Math.random()*H})}rs();addEventListener('resize',rs);
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 for(var i=0;i<60;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+.5,v:Math.random()*.6+.2,s:Math.random()*Math.PI*2});
 (function f(){x.clearRect(0,0,W,H);P.forEach(function(p){p.y-=p.v;p.s+=.02;p.x+=Math.sin(p.s)*.5;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}
  x.fillStyle='rgba('+(150+p.r*30|0)+',140,255,'+(.3+p.y/H*.6)+')';x.beginPath();x.arc(p.x,p.y,p.r,0,6.3);x.fill()});requestAnimationFrame(f)})()})();
/* exclusive sections, swipe transitions */
var links=[].slice.call(document.querySelectorAll('#dock a')),views=[].slice.call(document.querySelectorAll('main>section[id]')),cur=null,busy=false,pending=null,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function mark(id){links.forEach(function(a){var on=a.getAttribute('href')==='#'+id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
function go(id){
 var nx=document.getElementById(id);if(!nx||views.indexOf(nx)<0)return;
 if(busy){pending=id;return}
 if(nx===cur)return;
 scrollTo({top:0,behavior:reduce?'auto':'smooth'});
 var old=cur,dir=old?(views.indexOf(nx)>views.indexOf(old)?1:-1):0;
 nx.classList.add('active');cur=nx;mark(id);dispatchEvent(new Event('resize'));
 if(!old||reduce){if(old)old.classList.remove('active');return}
 busy=true;
 old.classList.add('leave',dir>0?'out-l':'out-r');nx.classList.add(dir>0?'in-r':'in-l');
 setTimeout(function(){old.classList.remove('active','leave','out-l','out-r');nx.classList.remove('in-r','in-l');busy=false;
  if(pending){var p=pending;pending=null;go(p)}},730)
}
addEventListener('hashchange',function(){go(location.hash.slice(1)||'intro')});
go(views.some(function(v){return '#'+v.id===location.hash})?location.hash.slice(1):'intro');
}
