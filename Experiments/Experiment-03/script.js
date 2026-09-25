const visions=[
 {title:"KLĄTWA ŚMIERCI",place:"PORT NYANZARU",omen:"Światło słabnie pod ziemią.",state:"ŹRÓDŁO ODNALEZIONE",clue:"Soulmonger · Omu",text:"Pięcioro wędrowców ruszyło za pogłoską o klątwie, która odbiera zmarłym drogę powrotną. Ślad prowadzi z Port Nyanzaru przez dżunglę aż do miasta Omu."},
 {title:"DROGA DO GROBU",place:"DŻUNGLA CHULT",omen:"Ślady urywają się przy czarnym kamieniu.",state:"OMU ODNALEZIONE",clue:"Szlak przez Chult",text:"Wyprawa przetrwała rzeki, ruiny, choroby i drapieżniki. Każdy kolejny ślad kierował ją głębiej, ku miejscu którego nie ma na mapach."},
 {title:"KRAINA ZĘBÓW",place:"DZIKI CHULT",omen:"Coś dużego porusza liście, choć wiatr ucichł.",state:"WROGIE TERYTORIUM",clue:"Dżungla · bestie · undead",text:"Chult nie jest tylko drogą. Jest żywą przeszkodą. Dinozaury, nieumarli i głód wymuszają wybory, których nie da się cofnąć."},
 {title:"PIĘCIU",place:"OMU",omen:"Pięć imion. Pięć kluczy. Żadne nie jest martwe.",state:"WIZJA ZWIĄZANA",clue:"Dziewięć bogów",text:"Ruiny Omu odsłaniają ślady dawnego kultu. Pięcioro bohaterów musi rozpoznać, które symbole są ostrzeżeniem, a które prowadzą dalej."},
 {title:"NIEDOMKNIĘTE WĄTKI",place:"OMU · ŚWIĄTYNIE",omen:"Przeszłość wciąż czeka na odpowiedź.",state:"OTWARTE ŚLADY",clue:"Świątynie · klucze",text:"Nie każdy trop prowadzi do głównego celu. Stare obietnice, więźniowie i tajemnice Omu nadal mogą zmienić drogę wyprawy."},
 {title:"DROGA W DÓŁ",place:"GROBOWIEC DZIEWIĘCIU BOGÓW",omen:"Kamień pamięta tych, którzy weszli pierwsi.",state:"GROBOWIEC OTWARTY",clue:"Dziewięć grobowców",text:"Pod Omu zaczyna się miejsce zbudowane jak pułapka. Każde przejście ma cenę, a kamień pamięta każdy błąd tych, którzy zeszli wcześniej."},
 {title:"SOULMONGER",place:"GŁĘBIA GROBU",omen:"Maszyna karmi się duszami.",state:"CEL ODNALEZIONY",clue:"Maszyna dusz",text:"Źródło klątwy nie jest legendą. Soulmonger pochłania dusze zmarłych i zasila coś znacznie większego niż sam grobowiec."},
 {title:"ZIELONE PIEKŁO",place:"SERCE CHULT",omen:"Dżungla nie chce oddać tego, co pochłonęła.",state:"POWRÓT NIEPEWNY",clue:"Chult · śmierć",text:"Nawet po znalezieniu odpowiedzi Chult pozostaje nieprzewidywalne. Droga powrotna może być równie niebezpieczna jak zejście pod Omu."},
 {title:"DRZWI PONIŻEJ",place:"POD OMU",omen:"Za ostatnimi drzwiami czeka źródło klątwy.",state:"OSTATNIE PRZEJŚCIE",clue:"Soulmonger · finał",text:"Ostatnie drzwi nie prowadzą już do kolejnego tropu. Prowadzą bezpośrednio do źródła problemu i końca wyprawy."}
];
const roman=["I","II","III","IV","V","VI","VII","VIII","IX"], ring=document.getElementById("glyphRing"), crystal=document.getElementById("crystal");
const titleEl=document.getElementById("visionTitle"), indexEl=document.getElementById("visionIndex"), placeEl=document.getElementById("location"), omenEl=document.getElementById("omenText"), vision=document.getElementById("vision");
const sheetTitle=document.getElementById("sheetTitle"),sheetPlace=document.getElementById("sheetPlace"),sheetText=document.getElementById("sheetText"),sheetState=document.getElementById("sheetState"),sheetClue=document.getElementById("sheetClue"),sheetKicker=document.getElementById("sheetKicker");
let current=0; const visited=new Set([0]);
visions.forEach(function(v,i){
 const b=document.createElement("button"); b.className="glyph"; b.setAttribute("aria-label","Wizja "+(i+1)+": "+v[0]); b.innerHTML="<span>"+roman[i]+"</span>";
 const a=i*40*Math.PI/180, radius=.31; b.style.setProperty("--angle",i*40+"deg"); b.style.transform="translate(-50%,-50%) rotate("+i*40+"deg) translateY(-145px) rotate("+(-i*40)+"deg)";
 b.addEventListener("click",function(e){e.stopPropagation();show(i)}); ring.appendChild(b);
});
function render(){Array.from(ring.children).forEach(function(b,i){b.classList.toggle("active",i===current);b.classList.toggle("visited",visited.has(i))})}
function show(i){current=(i+visions.length)%visions.length;visited.add(current);vision.style.filter="saturate(.1) brightness(.65) blur(4px)";setTimeout(function(){const v=visions[current];titleEl.textContent=v.title;indexEl.textContent=roman[current];placeEl.textContent=v.place;omenEl.textContent=v.omen;sheetTitle.textContent=v.title;sheetPlace.textContent=v.place;sheetText.textContent=v.text;sheetState.textContent=v.state;sheetClue.textContent=v.clue;sheetKicker.textContent="ZAPIS "+roman[current];vision.style.filter="";render()},160)}
show(0);
crystal.addEventListener("pointermove",function(e){const r=crystal.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/(r.width/2),y=(e.clientY-(r.top+r.height/2))/(r.height/2);crystal.querySelector(".glass").style.transform="perspective(700px) rotateX("+(y*-3)+"deg) rotateY("+(x*3)+"deg)"});
crystal.addEventListener("pointerleave",function(){crystal.querySelector(".glass").style.transform=""});
document.addEventListener("keydown",function(e){if(e.key==="ArrowRight")show(current+1);if(e.key==="ArrowLeft")show(current-1)});
function clock(){document.getElementById("time").textContent=new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})} clock();setInterval(clock,1000);