(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const links=$$('[data-nav]');
const labels=['01','02','03','04','05','06','07','08'];
links.forEach((a,i)=>{a.dataset.index=labels[i]||String(i+1).padStart(2,'0');a.title=a.textContent.trim()});
const hero=$('.hero');
const progress=document.createElement('div');progress.className='echtra-progress';document.body.append(progress);
const corner=document.createElement('div');corner.className='echtra-corner';corner.textContent='IRGAELIA · ANNUS MIRABILIS';document.body.append(corner);
const toast=document.createElement('div');toast.className='echtra-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),1900)}
function currentSection(){return location.hash.slice(1)||'campaign'}
function syncHero(id){const intro=id==='campaign';if(hero){hero.hidden=!intro;hero.setAttribute('aria-hidden',String(!intro));hero.classList.toggle('hero-exiting',false)}corner.hidden=intro;progress.style.width='0%'}
function updateActive(id){links.forEach(a=>a.classList.toggle('active',a.dataset.nav===id))}
function activate(id,scroll=true){const target=document.getElementById(id);if(!target||!target.classList.contains('section'))return;syncHero(id);updateActive(id);if(scroll)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-nav]');if(nav){activate(nav.dataset.nav,false);return}
 const opener=e.target.closest('[data-open-section]');if(opener)activate(opener.dataset.openSection,false);
});
window.addEventListener('popstate',()=>activate(currentSection(),false));
window.addEventListener('hashchange',()=>activate(currentSection(),false));
activate(currentSection(),false);
window.addEventListener('scroll',()=>{
 const max=document.documentElement.scrollHeight-innerHeight;
 progress.style.width=(max>0?scrollY/max*100:0)+'%';
},{passive:true});
document.addEventListener('keydown',e=>{
 if(e.altKey&&/^[1-8]$/.test(e.key)){const link=links[Number(e.key)-1];if(link){e.preventDefault();link.click();notify('SEKCJA '+labels[Number(e.key)-1]+' · '+link.textContent.trim())}}
 if(e.key==='Escape'){const active=document.activeElement;if(active&&active.blur)active.blur()}
});
/* Reveal elements as they enter view; keep reduced-motion users unaffected. */
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}}),{threshold:.08});
 const watch=()=>$$('.milestone,.chapter-card,.world-card,.party-card,.act-card,.session-row').forEach(el=>{if(!el.dataset.reveal){el.dataset.reveal='1';el.classList.add('reveal-pending');observer.observe(el)}});
 watch();new MutationObserver(watch).observe(document.querySelector('main'),{childList:true,subtree:true});
}
const style=document.createElement('style');style.textContent='.reveal-pending{opacity:0;transform:translateY(14px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.8,.2,1)}.reveal-pending.is-revealed{opacity:1;transform:translateY(0)}';document.head.append(style);
/* Pointer-driven light on larger screens, without replacing native cursors. */
if(matchMedia('(pointer:fine)').matches){
 document.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--pointer-x',e.clientX+'px');document.documentElement.style.setProperty('--pointer-y',e.clientY+'px')},{passive:true});
 const glow=document.createElement('div');glow.className='pointer-glow';document.body.append(glow);
 const gs=document.createElement('style');gs.textContent='.pointer-glow{position:fixed;z-index:0;inset:0;pointer-events:none;background:radial-gradient(330px circle at var(--pointer-x,-1000px) var(--pointer-y,-1000px),rgba(208,177,111,.045),transparent 72%)}';document.head.append(gs);
}

/* Command palette: Ctrl/Cmd+K opens direct section navigation. */
const palette=document.createElement('div');palette.className='echtra-palette';palette.hidden=true;
palette.innerHTML='<div class="palette-backdrop" data-palette-close></div><div class="palette-panel" role="dialog" aria-modal="true" aria-label="Nawigacja archiwum"><div class="palette-heading"><span>VENGRATH / QUICK ACCESS</span><kbd>ESC</kbd></div><input class="palette-input" type="search" placeholder="Szukaj sekcji archiwum…" aria-label="Szukaj sekcji"><div class="palette-results"></div><div class="palette-foot">ENTER · OTWÓRZ &nbsp;&nbsp; ↑ ↓ · WYBIERZ</div></div>';
document.body.append(palette);
const paletteInput=palette.querySelector('.palette-input'),results=palette.querySelector('.palette-results');
let selected=-1,filtered=[];
function drawResults(query=''){
 const q=query.toLocaleLowerCase('pl');
 filtered=links.filter(a=>a.textContent.trim().toLocaleLowerCase('pl').includes(q));
 results.replaceChildren();selected=filtered.length?0:-1;
 filtered.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='palette-result'+(i===selected?' selected':'');b.innerHTML='<span>'+a.dataset.index+'</span><strong></strong><i>↗</i>';b.querySelector('strong').textContent=a.textContent.trim();b.addEventListener('click',()=>{palette.hidden=true;a.click()});results.append(b)});
 if(!filtered.length){const empty=document.createElement('p');empty.className='palette-empty';empty.textContent='Brak pasujących sekcji.';results.append(empty)}
}
function openPalette(){palette.hidden=false;drawResults('');paletteInput.value='';paletteInput.focus()}
function closePalette(){palette.hidden=true}
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();return}
 if(palette.hidden)return;
 if(e.key==='Escape'){closePalette();return}
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();selected=(selected+(e.key==='ArrowDown'?1:-1)+filtered.length)%filtered.length;$('.palette-result').forEach((b,i)=>b.classList.toggle('selected',i===selected))}
 if(e.key==='Enter'&&selected>=0){e.preventDefault();filtered[selected].click()}
});
paletteInput.addEventListener('input',()=>drawResults(paletteInput.value));
palette.addEventListener('click',e=>{if(e.target.closest('[data-palette-close]'))closePalette()});

})();