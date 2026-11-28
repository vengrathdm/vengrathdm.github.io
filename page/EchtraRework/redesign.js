(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const nav=$$('.main-nav [data-nav]');
nav.forEach((a,i)=>{a.dataset.index=String(i+1).padStart(2,'0');a.setAttribute('aria-label',a.textContent.trim())});
const progress=document.createElement('div');progress.className='echtra-progress';document.body.append(progress);
const toast=document.createElement('div');toast.className='echtra-toast';toast.setAttribute('role','status');document.body.append(toast);
let toastTimer;
function notify(msg){toast.textContent=msg;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),1800)}
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%'},{passive:true});
/* Searchable archive command deck */
const palette=document.createElement('div');palette.className='echtra-palette';palette.hidden=true;
palette.innerHTML='<div class="palette-backdrop" data-palette-close></div><div class="palette-panel" role="dialog" aria-modal="true" aria-label="Nawigacja archiwum"><div class="palette-heading"><span>ECHTRA / ARCHIVE INDEX</span><kbd>ESC</kbd></div><input class="palette-input" type="search" placeholder="Wpisz nazwę sekcji…" aria-label="Szukaj sekcji"><div class="palette-results"></div><div class="palette-foot">ENTER · OTWÓRZ &nbsp;&nbsp; ↑ ↓ · WYBIERZ</div></div>';
document.body.append(palette);
const paletteInput=$('.palette-input',palette),results=$('.palette-results',palette);let filtered=[],selected=0;
function draw(q=''){const query=q.toLocaleLowerCase('pl');filtered=nav.filter(a=>a.textContent.trim().toLocaleLowerCase('pl').includes(query));results.replaceChildren();selected=0;filtered.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='palette-result'+(i===0?' selected':'');const n=document.createElement('span');n.textContent=a.dataset.index;const strong=document.createElement('strong');strong.textContent=a.textContent.trim();const arrow=document.createElement('i');arrow.textContent='↗';b.append(n,strong,arrow);b.addEventListener('click',()=>{close();a.click()});results.append(b)});if(!filtered.length){const p=document.createElement('p');p.className='palette-empty';p.textContent='Brak pasujących sekcji.';results.append(p)}}
function open(){palette.hidden=false;draw();paletteInput.value='';paletteInput.focus()}
function close(){palette.hidden=true}
paletteInput.addEventListener('input',()=>draw(paletteInput.value));
palette.addEventListener('click',e=>{if(e.target.closest('[data-palette-close]'))close()});
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();return}
 if(palette.hidden&&e.altKey&&/^[1-8]$/.test(e.key)){const a=nav[Number(e.key)-1];if(a){e.preventDefault();a.click();notify('OTWARTO / '+a.textContent.trim())}return}
 if(palette.hidden)return;
 if(e.key==='Escape'){close();return}
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&filtered.length){e.preventDefault();selected=(selected+(e.key==='ArrowDown'?1:-1)+filtered.length)%filtered.length;$$('.palette-result',palette).forEach((b,i)=>b.classList.toggle('selected',i===selected))}
 if(e.key==='Enter'&&filtered[selected]){e.preventDefault();filtered[selected].click()}
});
/* Chapter dossiers: tap a card to unfold its full campaign record. */
const modal=document.createElement('div');modal.className='chapter-modal';modal.hidden=true;modal.innerHTML='<div class="chapter-modal-backdrop" data-modal-close></div><article class="chapter-modal-panel" role="dialog" aria-modal="true" aria-label="Dossier rozdziału"><button class="chapter-modal-close" type="button" aria-label="Zamknij">×</button><div class="chapter-modal-body"></div></article>';document.body.append(modal);
const modalBody=$('.chapter-modal-body',modal);
let campaignData=null;
fetch('./campaign.json').then(r=>r.ok?r.json():null).then(d=>campaignData=d).catch(()=>{});
function closeModal(){modal.hidden=true;document.body.classList.remove('modal-open')}
function openChapter(card){
 if(!campaignData)return;
 const number=Number(card.querySelector('.chapter-card-top span:last-child')?.textContent.match(/\d+/)?.[0]);
 const chapter=campaignData.chapters.find(c=>c.number===number);if(!chapter)return;
 modalBody.replaceChildren();
 const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent='CHAPTER DOSSIER / '+String(number).padStart(2,'0');
 const title=document.createElement('h2');title.textContent=chapter.title;
 const hook=document.createElement('p');hook.className='chapter-modal-hook';hook.textContent=chapter.hook;
 modalBody.append(eyebrow,title,hook);
 const fields=[['OBJECTIVE',chapter.goal],['ANTAGONIST',chapter.antagonist],['LOCATIONS',(chapter.places||[]).join(' · ')],['CONSEQUENCE',chapter.turn||'']].filter(x=>x[1]);
 fields.forEach(([label,value])=>{const row=document.createElement('div');row.className='chapter-modal-field';const small=document.createElement('span');small.textContent=label;const p=document.createElement('p');p.textContent=value;row.append(small,p);modalBody.append(row)});
 const close=document.createElement('button');close.type='button';close.className='button button-gold chapter-modal-done';close.textContent='WRÓĆ DO ROZDZIAŁÓW';close.addEventListener('click',closeModal);modalBody.append(close);
 modal.hidden=false;document.body.classList.add('modal-open');
}
document.addEventListener('click',e=>{
 const card=e.target.closest('.chapter-card');
 if(card&&!e.target.closest('button'))openChapter(card);
 if(e.target.closest('.chapter-modal-close,[data-modal-close]'))closeModal();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});
/* Staggered reveal for dynamically rendered archive entries. */
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}}),{threshold:.08});
 const seen=new WeakSet();
 const watch=()=>$$('.milestone,.chapter-card,.world-card,.party-card,.act-card,.session-row').forEach(el=>{if(!seen.has(el)){seen.add(el);el.classList.add('reveal-pending');observer.observe(el)}});
 watch();new MutationObserver(watch).observe(document.querySelector('main'),{childList:true,subtree:true});
}
})();