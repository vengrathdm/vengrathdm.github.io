// Experiment 02 — Tomb of Annihilation crystal-ball scrying archive

const visions = [
  {
    title:"THE DEATH CURSE",
    kicker:"VISION I · CAMPAIGN MASTER FILE",
    html:`<div class="page">
      <small>THE DEATH CURSE · CURRENT RECORD</small>
      <h1>THE DEATH<br><em>CURSE</em></h1>
      <p>A five-character expedition into Chult, from the first rumors in Port Nyanzaru to the final descent beneath Omu. The party discovered that the dead are being denied their return by an ancient engine of souls.</p>
      <div class="grid">
        <article><b>THE QUEST</b><span class="meter"><i style="width:91%"></i></span><p>Find the Soulmonger. Reach its heart. End the curse.</p></article>
        <article><b>WHERE THE PARTY STANDS</b><p>OMU REACHED · TOMB BREACHED · FINAL CONFRONTATION PENDING</p></article>
      </div>
    </div>`
  },
  {
    title:"FROM PORT TO TOMB",
    kicker:"VISION II · WHAT HAS HAPPENED",
    html:`<div class="page">
      <small>THE ROAD SO FAR</small>
      <h1>FROM PORT<br><em>TO THE TOMB</em></h1>
      <p>The campaign began with a missing researcher, a wasting curse and one impossible lead: somewhere beyond the jungles of Chult was the source.</p>
      <div class="list">
        <div><span>PORT NYANZARU</span><b>The expedition begins.</b></div>
        <div><span>CHULT</span><b>Undead, disease, dinosaurs and ruins.</b></div>
        <div><span>OMU</span><b>The lost city is found.</b></div>
        <div><span>NINE GODS</span><b>The Tomb is entered.</b></div>
        <div><span>SOULMONGER</span><b>The machine is finally within reach.</b></div>
      </div>
    </div>`
  },
  {
    title:"LAND OF TEETH",
    kicker:"VISION III · THE WORLD",
    html:`<div class="page">
      <small>SCRYING RANGE · CHULT</small>
      <h1>LAND OF<br><em>TEETH</em></h1>
      <p>Chult makes distance dangerous. Every river, ruin and trail can become a survival problem, while the jungle hides creatures and factions that know the land far better than the adventurers.</p>
      <div class="grid">
        <article><b>PORT NYANZARU</b><p>Trade, rumors, supplies and the expedition's last dependable refuge.</p></article>
        <article><b>THE JUNGLE</b><p>Rivers, cliffs, ruins, undead patrols and things large enough to eat the party.</p></article>
        <article><b>OMU</b><p>A dead holy city where the party solved the shrines and found the Tomb.</p></article>
        <article><b>THE TOMB</b><p>A deathtrap built around the spirits of the Nine Trickster Gods and the Soulmonger.</p></article>
      </div>
    </div>`
  },
  {
    title:"THE FIVE",
    kicker:"VISION IV · PARTY",
    html:`<div class="page">
      <small>ACTIVE PARTY · FIVE SOULS</small>
      <h1>THE FIVE<br><em>WHO WENT IN</em></h1>
      <div class="list">
        <div><span>SEREN VOSS</span><b>Human Paladin · Front line</b></div>
        <div><span>NYX AMARIN</span><b>Half-Elf Rogue · Scout / traps</b></div>
        <div><span>BRAM COPPER</span><b>Dwarf Cleric · Keeper of the dead</b></div>
        <div><span>IRI KEST</span><b>Tiefling Wizard · Arcane research</b></div>
        <div><span>TAVI REED</span><b>Halfling Ranger · Jungle guide</b></div>
      </div>
      <p>Current condition: exhausted, short on safe resources, carrying dangerous relics, and unwilling to leave the Soulmonger behind.</p>
    </div>`
  },
  {
    title:"OPEN THREADS",
    kicker:"VISION V · DM SIGHT",
    html:`<div class="page">
      <small>PRIVATE SCRYING · DM ONLY</small>
      <h1>OPEN<br><em>THREADS</em></h1>
      <p>The campaign's unresolved wires. These are not history; they are the things waiting to become scenes.</p>
      <div class="grid">
        <article><b>UNRESOLVED</b><p>Ras Nsi's fate · Acererak's identity · the remaining Trickster Gods · the Soulmonger chamber.</p></article>
        <article><b>THE COST</b><p>Whether everyone survives. What the party sacrifices. Who, if anyone, gets a second life.</p></article>
      </div>
    </div>`
  },
  {
    title:"THE ROAD DOWN",
    kicker:"VISION VI · SESSION ARCHIVE",
    html:`<div class="page">
      <small>RECORDED CAMPAIGN ARCS</small>
      <h1>THE ROAD<br><em>DOWN</em></h1>
      <div class="list">
        <div><span>01–04</span><b>The Contract at Port Nyanzaru</b></div>
        <div><span>05–09</span><b>Green Hell</b></div>
        <div><span>10–13</span><b>The City That Time Forgot</b></div>
        <div><span>14–17</span><b>Gods in Small Places</b></div>
        <div><span>18–21</span><b>The Tomb Opens</b></div>
        <div><span>22+</span><b>The Last Descent</b></div>
      </div>
    </div>`
  },
  {
    title:"THE SOULMONGER",
    kicker:"VISION VII · OMEN",
    html:`<div class="page">
      <small>THE ORACLE SHOWS WHAT IT CAN</small>
      <h1>THE<br><em>SOULMONGER</em></h1>
      <p class="omen-large">THE DEAD DO NOT SLEEP.</p>
      <article class="wide"><b>THE VISION</b><p>The curse is not merely preventing resurrection. Something beneath Omu is taking the souls that should have returned to the living. Every day the machine remains active, fewer people can be restored.</p></article>
      <article class="wide"><b>THE NAME BEHIND IT</b><p>The Tomb is the lock. The Soulmonger is the weapon. Acererak is the intelligence behind it.</p></article>
    </div>`
  },
  {
    title:"GREEN HELL",
    kicker:"VISION VIII · FIELD IMPRESSION",
    html:`<div class="page visual-page">
      <small>THE JUNGLE AS REMEMBERED BY THE ORACLE</small>
      <div class="vision-image jungle"><span>CHULT</span><b>GREEN HELL</b><i>◆</i></div>
      <p>Rain. River water. Ruined stone. Dinosaur tracks. Undead in the distance. The party's journey through Chult reduced to one unstable image.</p>
    </div>`
  },
  {
    title:"THE DOOR BELOW",
    kicker:"VISION IX · OMU",
    html:`<div class="page visual-page">
      <small>THE LAST IMAGE BEFORE THE DESCENT</small>
      <div class="vision-image tomb"><span>THE NINE GODS</span><b>THE DOOR<br>BELOW</b><i>◈</i></div>
      <p>The party has crossed the threshold. Whatever happens next belongs to the Tomb.</p>
    </div>`
  }
];

let currentVision=0;
let seconds=0;
let awakened=true;
let visited=new Set();
let scryTimer=null;

const vision=document.getElementById("vision");
const crystal=document.getElementById("crystal");
const visionNumber=document.getElementById("visionNumber");
const visionName=document.getElementById("visionName");
const list=document.getElementById("visions");
const omenText=document.getElementById("omenText");
const progressText=document.getElementById("progressText");
const progressBar=document.getElementById("progressBar");
const complete=document.getElementById("complete");

visions.forEach((item,index)=>{
  const button=document.createElement("button");
  button.className="vision-button";
  button.innerHTML=`<small>0${index+1}</small><span>${item.title}</span><i>✦</i>`;
  button.addEventListener("click",()=>openVision(index));
  list.appendChild(button);
});

function scryTransition(){crystal.classList.remove("scrying");void crystal.offsetWidth;crystal.classList.add("scrying");clearTimeout(scryTimer);scryTimer=setTimeout(()=>crystal.classList.remove("scrying"),1400)}
function openVision(index){
  currentVision=(index+visions.length)%visions.length;
  visited.add(currentVision);
  progressText.textContent=`WIZJE ODWIEDZONE ${visited.size} / 9`;
  progressBar.style.width=`${visited.size/9*100}%`;
  if(visited.size===9)setTimeout(()=>complete.classList.add("show"),900);
  scryTransition();
  const item=visions[currentVision];

  document.querySelectorAll(".vision-button").forEach((button,i)=>button.classList.toggle("active",i===currentVision));
  visionNumber.textContent="VISION "+["I","II","III","IV","V","VI","VII","VIII","IX"][currentVision];
  visionName.textContent=item.title;
  omenText.textContent=currentVision===6?"THE SOULMONGER IS HUNGRY.":currentVision===8?"THE DOOR HAS ALREADY OPENED.":"THE DEAD DO NOT SLEEP.";

  vision.animate(
    [{opacity:1,filter:"blur(0) scale(1)"},{opacity:0,filter:"blur(18px) scale(1.08)"},{opacity:1,filter:"blur(0) scale(1)"}],
    {duration:750,easing:"ease-in-out"}
  );

  setTimeout(()=>{vision.innerHTML=item.html;},260);
}

function toggleAwaken(){
  awakened=!awakened;
  crystal.classList.toggle("sealed",!awakened);
  document.getElementById("awaken").textContent=awakened?"SEAL THE VISION":"AWAKEN THE VISION";
}

document.getElementById("awaken").addEventListener("click",toggleAwaken);

document.getElementById("reveal").addEventListener("click",()=>{omenText.textContent=currentVision===6?"SOULMONGER JEST GŁODNY.":currentVision===8?"DRZWI JUŻ SIĘ OTWORZYŁY.":visions[currentVision].kicker;});complete.addEventListener("click",()=>complete.classList.remove("show"));
document.getElementById("dim").addEventListener("click",()=>{
  crystal.animate(
    [{filter:"brightness(1)"},{filter:"brightness(.35) saturate(.5)"},{filter:"brightness(1)"}],
    {duration:500,easing:"ease-in-out"}
  );
});

window.addEventListener("keydown",event=>{
  if(event.key==="ArrowRight"||event.key==="ArrowDown")openVision(currentVision+1);
  if(event.key==="ArrowLeft"||event.key==="ArrowUp")openVision(currentVision-1);
  if(event.key===" ")toggleAwaken();
});

setInterval(()=>{
  seconds++;
  const h=Math.floor(seconds/3600),m=Math.floor(seconds/60)%60,s=seconds%60;
  document.getElementById("clock").textContent=[h,m,s].map(v=>String(v).padStart(2,"0")).join(":");
},1000);

openVision(0);
window.addEventListener("pointermove",e=>{document.documentElement.style.setProperty("--mx",((e.clientX/innerWidth-.5)*2).toFixed(3));document.documentElement.style.setProperty("--my",((e.clientY/innerHeight-.5)*2).toFixed(3));});
