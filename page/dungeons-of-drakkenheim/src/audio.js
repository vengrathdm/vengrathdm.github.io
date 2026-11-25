export function initCampaignAudio(){

 var root=document.getElementById('odyssey-audio');if(!root)return;
 var audio=root.querySelector('audio'),button=root.querySelector('button'),ring=root.querySelector('.audio-ring'),drag=false;
 audio.volume=.5;
 function paint(){var v=Math.round(audio.volume*100),deg=audio.volume*360;ring.style.background='conic-gradient(#a78bfa 0deg '+deg+'deg,rgba(220,207,177,.22) '+deg+'deg 360deg)';ring.setAttribute('aria-valuenow',v)}
 function state(){var playing=!audio.paused;button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'Wstrzymaj muzykę':'Odtwórz muzykę');button.innerHTML=playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'}
 button.addEventListener('click',function(){if(audio.paused)audio.play().catch(function(){});else audio.pause()});
 // Attempt autoplay on page load; browsers may defer it until a user gesture.
 audio.play().catch(function(){state()});
 audio.addEventListener('play',state);audio.addEventListener('pause',state);audio.addEventListener('ended',state);
 function setFromPointer(e){var r=ring.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,a=Math.atan2(e.clientY-cy,e.clientX-cx)+Math.PI/2;if(a<0)a+=Math.PI*2;audio.volume=Math.max(0,Math.min(1,a/(Math.PI*2)));paint()}
 ring.addEventListener('pointerdown',function(e){drag=true;ring.setPointerCapture(e.pointerId);setFromPointer(e);e.preventDefault()});
 ring.addEventListener('pointermove',function(e){if(drag)setFromPointer(e)});
 ring.addEventListener('pointerup',function(){drag=false});ring.addEventListener('pointercancel',function(){drag=false});
 ring.addEventListener('keydown',function(e){if(e.key==='ArrowUp'||e.key==='ArrowRight'){audio.volume=Math.min(1,audio.volume+.05);e.preventDefault()}else if(e.key==='ArrowDown'||e.key==='ArrowLeft'){audio.volume=Math.max(0,audio.volume-.05);e.preventDefault()}else return;paint()});
 paint();state();

}
