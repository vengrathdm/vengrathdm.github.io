(function(){
 const buttons=document.querySelectorAll('[data-scroll]');
 buttons.forEach(b=>b.addEventListener('click',e=>{
   const el=document.querySelector(b.dataset.scroll);
   if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}
 }));
 const reveal=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target)}});
 },{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
})();