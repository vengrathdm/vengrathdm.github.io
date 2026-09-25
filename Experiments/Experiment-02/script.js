// Experiment 02 — Tomb of Annihilation crystal-ball scrying archive

const visions = [
  {
    title:"KLĄTWA ŚMIERCI",
    kicker:"WIZJA I · GŁÓWNY ZAPIS KAMPANII",
    html:`<div class="page">
      <small>KLĄTWA ŚMIERCI · CURRENT RECORD</small>
      <h1>KLĄTWA<br><em>ŚMIERCI</em></h1>
      <p>Wyprawa pięciorga bohaterów do Chult — od pierwszych pogłosek w Port Nyanzaru aż po zejście pod Omu. Drużyna odkryła, że zmarłym odmawia się powrotu do życia przez starożytny mechanizm dusz.</p>
      <div class="grid">
        <article><b>CEL WYPRAWY</b><span class="meter"><i style="width:91%"></i></span><p>Odnaleźć Soulmongera. Dotrzeć do jego serca. Zakończyć klątwę.</p></article>
        <article><b>POZYCJA DRUŻYNY</b><p>OMU ODNALEZIONE · GROBOWIEC PRZEBITY · OSTATECZNE STARCIE NADCHODZI</p></article>
      </div>
    </div>`
  },
  {
    title:"OD PORTU DO GROBOWCA",
    kicker:"WIZJA II · CO SIĘ WYDARZYŁO",
    html:`<div class="page">
      <small>DROGA DO TEJ PORY</small>
      <h1>OD PORTU<br><em>DO GROBOWCA</em></h1>
      <p>Kampania zaczęła się od zaginionego badacza, wyniszczającej klątwy i jednego niemożliwego tropu: gdzieś za dżunglami Chult znajdowało się jej źródło.</p>
      <div class="list">
        <div><span>PORT NYANZARU</span><b>Wyprawa się rozpoczyna.</b></div>
        <div><span>CHULT</span><b>Nieumarli, choroby, dinozaury i ruiny.</b></div>
        <div><span>OMU</span><b>Odnaleziono zaginione miasto.</b></div>
        <div><span>NINE GODS</span><b>Drużyna wchodzi do Grobowca.</b></div>
        <div><span>SOULMONGER</span><b>Maszyna jest wreszcie w zasięgu.</b></div>
      </div>
    </div>`
  },
  {
    title:"KRAINA KŁÓW",
    kicker:"WIZJA III · ŚWIAT",
    html:`<div class="page">
      <small>ZASIĘG WRÓŻENIA · CHULT</small>
      <h1>KRAINA<br><em>KŁÓW</em></h1>
      <p>Chult sprawia, że każda odległość jest niebezpieczna. Każda rzeka, ruina i ścieżka może stać się walką o przetrwanie, a dżungla kryje stworzenia i frakcje znające tę krainę znacznie lepiej niż poszukiwacze przygód.</p>
      <div class="grid">
        <article><b>PORT NYANZARU</b><p>Handel, plotki, zapasy i ostatnie pewne schronienie wyprawy.</p></article>
        <article><b>THE JUNGLE</b><p>Rzeki, urwiska, ruiny, patrole nieumarłych i stworzenia dość wielkie, by pożreć drużynę.</p></article>
        <article><b>OMU</b><p>Martwe święte miasto, w którym drużyna rozwiązała zagadki świątyń i odnalazła Grobowiec.</p></article>
        <article><b>THE TOMB</b><p>Śmiertelna pułapka zbudowana wokół duchów Dziewięciu Podstępnych Bogów i Soulmongera.</p></article>
      </div>
    </div>`
  },
  {
    title:"PIĘCIORO",
    kicker:"WIZJA IV · DRUŻYNA",
    html:`<div class="page">
      <small>AKTYWNA DRUŻYNA · PIĘĆ DUSZ</small>
      <h1>PIĘCIORO<br><em>WHO WENT IN</em></h1>
      <div class="list">
        <div><span>SEREN VOSS</span><b>Człowiek, Paladyn · Pierwsza linia</b></div>
        <div><span>NYX AMARIN</span><b>Półelf, Łotrzyk · Zwiad / pułapki</b></div>
        <div><span>BRAM COPPER</span><b>Krasnolud, Kleryk · Strażnik zmarłych</b></div>
        <div><span>IRI KEST</span><b>Tiefling, Czarodziej · Badania magiczne</b></div>
        <div><span>TAVI REED</span><b>Niziołek, Tropiciel · Przewodnik po dżungli</b></div>
      </div>
      <p>Stan obecny: wyczerpani, z niewielkimi zapasami, z niebezpiecznymi reliktami przy sobie i niechętni, by zostawić Soulmongera za sobą.</p>
    </div>`
  },
  {
    title:"OTWARTE WĄTKI",
    kicker:"WIZJA V · WIDZENIE MG",
    html:`<div class="page">
      <small>PRYWATNE WRÓŻENIE · TYLKO DLA MG</small>
      <h1>OTWARTE<br><em>WĄTKI</em></h1>
      <p>Nierozwiązane nici kampanii. To nie historia; to sprawy czekające, by stać się scenami.</p>
      <div class="grid">
        <article><b>NIEROZWIĄZANE</b><p>Los Ras Nsi · tożsamość Acereraka · pozostali Podstępni Bogowie · komnata Soulmongera.</p></article>
        <article><b>CENA</b><p>Czy wszyscy przeżyją. Co poświęci drużyna. Kto, jeśli ktokolwiek, dostanie drugie życie.</p></article>
      </div>
    </div>`
  },
  {
    title:"DROGA W DÓŁ",
    kicker:"WIZJA VI · ARCHIWUM SESJI",
    html:`<div class="page">
      <small>ZAPISANE ŁUKI KAMPANII</small>
      <h1>DROGA<br><em>W DÓŁ</em></h1>
      <div class="list">
        <div><span>01–04</span><b>Kontrakt w Port Nyanzaru</b></div>
        <div><span>05–09</span><b>Zielone Piekło</b></div>
        <div><span>10–13</span><b>Miasto, o którym zapomniał czas</b></div>
        <div><span>14–17</span><b>Bogowie w małych miejscach</b></div>
        <div><span>18–21</span><b>Grobowiec się otwiera</b></div>
        <div><span>22+</span><b>Ostatnie zejście</b></div>
      </div>
    </div>`
  },
  {
    title:"SOULMONGER",
    kicker:"WIZJA VII · OMEN",
    html:`<div class="page">
      <small>WYROCZNIA POKAZUJE TO, CO MOŻE</small>
      <h1><em>SOULMONGER</em></h1>
      <p class="omen-large">UMARLI NIE ŚPIĄ.</p>
      <article class="wide"><b>WIZJA</b><p>Klątwa nie tylko uniemożliwia wskrzeszenie. Coś pod Omu zabiera dusze, które powinny powrócić do żywych. Każdego dnia, gdy maszyna działa, coraz mniej osób może zostać przywróconych życiu.</p></article>
      <article class="wide"><b>IMIĘ ZA TYM WSZYSTKIM</b><p>Grobowiec jest zamkiem. Soulmonger jest bronią. Acererak stoi za wszystkim.</p></article>
    </div>`
  },
  {
    title:"ZIELONE PIEKŁO",
    kicker:"WIZJA VIII · OBRAZ Z TERENU",
    html:`<div class="page visual-page">
      <small>DŻUNGLA TAK, JAK ZAPAMIĘTAŁA JĄ WYROCZNIA</small>
      <div class="vision-image jungle"><span>CHULT</span><b>ZIELONE PIEKŁO</b><i>◆</i></div>
      <p>Deszcz. Woda rzeki. Zrujnowany kamień. Ślady dinozaurów. Nieumarli w oddali. Podróż drużyny przez Chult sprowadzona do jednego niestabilnego obrazu.</p>
    </div>`
  },
  {
    title:"DRZWI W GŁĘBI",
    kicker:"WIZJA IX · OMU",
    html:`<div class="page visual-page">
      <small>OSTATNI OBRAZ PRZED ZEJŚCIEM</small>
      <div class="vision-image tomb"><span>DZIEWIĘCIU BOGÓW</span><b>DRZWI<br>W GŁĘBI</b><i>◈</i></div>
      <p>Drużyna przekroczyła próg. Cokolwiek wydarzy się dalej, należy już do Grobowca.</p>
    </div>`
  }
];

let currentVision=0;
let seconds=0;
let awakened=true;

const vision=document.getElementById("vision");
const crystal=document.getElementById("crystal");
const visionNumber=document.getElementById("visionNumber");
const visionName=document.getElementById("visionName");
const list=document.getElementById("visions");
const omenText=document.getElementById("omenText");

visions.forEach((item,index)=>{
  const button=document.createElement("button");
  button.className="vision-button";
  button.innerHTML=`<small>0${index+1}</small><span>${item.title}</span><i>✦</i>`;
  button.addEventListener("click",()=>openVision(index));
  list.appendChild(button);
});

function openVision(index){
  currentVision=(index+visions.length)%visions.length;
  const item=visions[currentVision];

  document.querySelectorAll(".vision-button").forEach((button,i)=>button.classList.toggle("active",i===currentVision));
  visionNumber.textContent="WIZJA "+["I","II","III","IV","V","VI","VII","VIII","IX"][currentVision];
  visionName.textContent=item.title;
  omenText.textContent=currentVision===6?"SOULMONGER IS HUNGRY.":currentVision===8?"DRZWI JUŻ SIĘ OTWORZYŁY.":"UMARLI NIE ŚPIĄ.";

  vision.animate(
    [{opacity:1,filter:"blur(0) scale(1)"},{opacity:0,filter:"blur(18px) scale(1.08)"},{opacity:1,filter:"blur(0) scale(1)"}],
    {duration:750,easing:"ease-in-out"}
  );

  setTimeout(()=>{vision.innerHTML=item.html;},260);
}

function toggleAwaken(){
  awakened=!awakened;
  crystal.classList.toggle("sealed",!awakened);
  document.getElementById("awaken").textContent=awakened?"SEAL WIZJA":"AWAKEN WIZJA";
}

document.getElementById("awaken").addEventListener("click",toggleAwaken);

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