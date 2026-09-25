const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
$('#menu').onclick=()=>$('#drawer').classList.add('open');$('#close').onclick=()=>$('#drawer').classList.remove('open');
$$('#drawer a').forEach(a=>a.onclick=()=>$('#drawer').classList.remove('open'));
$$('[data-scroll]').forEach(b=>b.onclick=()=>$(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
const data={rina:['RINA','WPOLUWIATR','Active party record. Character-specific class, race, level and Epic Path are intentionally not fabricated.'],xavier:['XAVIER','ARCHANGELSS','Active party record. Character-specific class, race, level and Epic Path are intentionally not fabricated.'],xastar:['XASTAR','LECPOWODE','Active party record. Character-specific class, race, level and Epic Path are intentionally not fabricated.'],vespera:['VESPERA','MARIA','Active party record. Character-specific class, race, level and Epic Path are intentionally not fabricated.'],zander:['ZANDER','KUBA','Active party record. Character-specific class, race, level and Epic Path are intentionally not fabricated.']};
$$('.player').forEach(card=>card.onclick=()=>{const d=data[card.dataset.player];$('#telemetry').innerHTML='<div><b>'+d[0]+'</b><span>'+d[1]+'</span></div><p>'+d[2]+'</p>';$$('.player').forEach(x=>x.classList.remove('active'));card.classList.add('active')});
let integrity=62;$('#breakOath').onclick=()=>{integrity=Math.max(7,integrity-11);$('#integrity').textContent=integrity+'%';$('#ring').style.transform='rotate('+(62-integrity)*3+'deg)'};
$('#signal').onclick=()=>{$('#signal').textContent='FATE SYNCED ✓';document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.5)'},{filter:'brightness(1)'}],600)};
$$('.player button').forEach(b=>b.onclick=e=>e.stopPropagation());
