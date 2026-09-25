const visions=[
["KLĄTWA ŚMIERCI","PORT NYANZARU","Światło słabnie pod ziemią."],["DROGA DO GROBU","DŻUNGLA CHULT","Ślady urywają się przy czarnym kamieniu."],["KRAINA ZĘBÓW","DZIKI CHULT","Coś dużego porusza liście, choć wiatr ucichł."],["PIĘCIU","OMU","Pięć imion. Pięć kluczy. Żadne nie jest martwe."],["NIEDOMKNIĘTE WĄTKI","OMU · ŚWIĄTYNIE","Przeszłość wciąż czeka na odpowiedź."],["DROGA W DÓŁ","GROBOWIEC DZIEWIĘCIU BOGÓW","Kamień pamięta tych, którzy weszli pierwsi."],["SOULMONGER","GŁĘBIA GROBU","Maszyna karmi się duszami."],["ZIELONE PIEKŁO","SERCE CHULT","Dżungla nie chce oddać tego, co pochłonęła."],["DRZWI PONIŻEJ","POD OMU","Za ostatnimi drzwiami czeka źródło klątwy."]
];
const roman=["I","II","III","IV","V","VI","VII","VIII","IX"], ring=document.getElementById("glyphRing"), crystal=document.getElementById("crystal");
const titleEl=document.getElementById("visionTitle"), indexEl=document.getElementById("visionIndex"), placeEl=document.getElementById("location"), omenEl=document.getElementById("omenText"), vision=document.getElementById("vision");
let current=0; const visited=new Set([0]);
visions.forEach(function(v,i){
 const b=document.createElement("button"); b.className="glyph"; b.setAttribute("aria-label","Wizja "+(i+1)+": "+v[0]); b.innerHTML="<span>"+roman[i]+"</span>";
 const a=i*40*Math.PI/180, radius=.31; b.style.transform="translate(calc(-50% + "+Math.sin(a)*100+"%), calc(-50% - "+Math.cos(a)*100+"%)) scale("+(.92+radius*0.08)+")";
 b.addEventListener("click",function(e){e.stopPropagation();show(i)}); ring.appendChild(b);
});
function render(){Array.from(ring.children).forEach(function(b,i){b.classList.toggle("active",i===current);b.classList.toggle("visited",visited.has(i))})}
function show(i){current=(i+visions.length)%visions.length;visited.add(current);vision.style.filter="saturate(.1) brightness(.65) blur(4px)";setTimeout(function(){const v=visions[current];titleEl.textContent=v[0];indexEl.textContent=roman[current];placeEl.textContent=v[1];omenEl.textContent=v[2];vision.style.filter="";render()},160)}
show(0);
crystal.addEventListener("pointermove",function(e){const r=crystal.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/(r.width/2),y=(e.clientY-(r.top+r.height/2))/(r.height/2);crystal.querySelector(".glass").style.transform="perspective(700px) rotateX("+(y*-3)+"deg) rotateY("+(x*3)+"deg)"});
crystal.addEventListener("pointerleave",function(){crystal.querySelector(".glass").style.transform=""});
document.addEventListener("keydown",function(e){if(e.key==="ArrowRight")show(current+1);if(e.key==="ArrowLeft")show(current-1)});
function clock(){document.getElementById("time").textContent=new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})} clock();setInterval(clock,1000);