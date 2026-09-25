// Experiment 02 — Tomb of Annihilation crystal-ball scrying archive

const channels = {
  1: {
    name: "CAMPAIGN OVERVIEW",
    html: `<div class="page">
      <small>CH 01 · CAMPAIGN MASTER FILE</small>
      <h1>THE DEATH<br><em>CURSE</em></h1>
      <p>A five-character expedition into Chult, recorded from the first rumors in Port Nyanzaru to the final descent beneath Omu. The party began hunting the source of a wasting curse and eventually discovered that the dead were being denied their resurrection by an ancient engine of souls.</p>
      <div class="grid2">
        <div class="box"><b>PRIMARY OBJECTIVE</b><div class="bar"><i style="width:91%"></i></div><p>Find the Soulmonger, reach its heart, and end the Death Curse before the party's allies and the wider world run out of time.</p></div>
        <div class="box"><b>CAMPAIGN STATE</b><p>OMEGA · OPPOSITION ACTIVE · OMU REACHED · TOMB BREACHED · FINAL CONFRONTATION PENDING</p></div>
      </div>
    </div>`
  },

  2: {
    name: "CAMPAIGN HISTORY",
    html: `<div class="page">
      <small>CH 02 · FIELD HISTORY</small>
      <h1>FROM PORT<br><em>TO THE TOMB</em></h1>
      <p>The campaign started with a missing researcher, a dying world, and a rumor that the answer lay somewhere beyond the jungles of Chult.</p>
      <div class="list">
        <div><span>01 · PORT NYANZARU</span><b>Accepted the expedition contract</b></div>
        <div><span>02 · CHULT JUNGLE</span><b>Survived undead, disease, dinosaurs and weather</b></div>
        <div><span>03 · OMU</span><b>Located the ruined city and its hidden entrance</b></div>
        <div><span>04 · NINE GODS</span><b>Entered the Tomb of the Nine Gods</b></div>
        <div><span>05 · SOULMONGER</span><b>Reached the machine's inner sanctum</b></div>
      </div>
    </div>`
  },

  3: {
    name: "THE WORLD",
    html: `<div class="page">
      <small>CH 03 · CHULT / SURROUNDING THEATRE</small>
      <h1>LAND OF<br><em>TEETH</em></h1>
      <p>Chult is a place where distance is an adversary. Every route can become a survival problem, every ruin can hide an ambush, and every guide has a reason for knowing the jungle better than the adventurers do.</p>
      <div class="grid2">
        <div class="box"><b>PORT NYANZARU</b><p>Trade city, departure point, rumor mill and the party's last reliable source of supplies.</p></div>
        <div class="box"><b>HEART OF UBTAO</b><p>A jungle of rivers, cliffs, ruins and undead territory surrounding the lost city of Omu.</p></div>
        <div class="box"><b>OMU</b><p>A dead holy city where the party solved the shrines, negotiated with rival expeditions and found the Tomb.</p></div>
        <div class="box"><b>TOMB OF THE NINE GODS</b><p>A sealed deathtrap built to contain the remains of nine trickster spirits and the machine consuming souls.</p></div>
      </div>
    </div>`
  },

  4: {
    name: "THE PARTY",
    html: `<div class="page">
      <small>CH 04 · ACTIVE PARTY ROSTER</small>
      <h1>THE FIVE<br><em>WHO WENT IN</em></h1>
      <div class="list">
        <div><span>01 · SEREN VOSS</span><b>Human Paladin · Oathbound Front Line</b></div>
        <div><span>02 · NYX AMARIN</span><b>Half-Elf Rogue · Scout / Trap Specialist</b></div>
        <div><span>03 · BRAM COPPER</span><b>Dwarf Cleric · Keeper of the Dead</b></div>
        <div><span>04 · IRI KEST</span><b>Tiefling Wizard · Arcane Research</b></div>
        <div><span>05 · TAVI REED</span><b>Halfling Ranger · Jungle Guide</b></div>
      </div>
      <p>Current condition: exhausted, low on safe supplies, carrying several dangerous relics, and unwilling to leave the Soulmonger behind.</p>
    </div>`
  },

  5: {
    name: "DM FEED",
    html: `<div class="page">
      <small>CH 05 · PRIVATE DM CONSOLE</small>
      <h1>OPEN<br><em>THREADS</em></h1>
      <p>Notes visible only to the person running the game. These are the campaign's live wires rather than a clean retrospective.</p>
      <div class="box">
        <b>THREADS STILL ALIVE</b>
        <p>Ras Nsi's fate · Acererak's identity · What remains of the trickster gods · The final Soulmonger chamber · Whether anyone gets out with the black opal intact · What the party will sacrifice to end the curse.</p>
      </div>
      <div class="list">
        <div><span>PARTY RESOURCES</span><b>CRITICAL</b></div>
        <div><span>TIME PRESSURE</span><b>EXTREME</b></div>
        <div><span>KNOWN SAFE REST</span><b>NONE</b></div>
        <div><span>FINAL BOSS LOCATION</span><b>CONFIRMED</b></div>
      </div>
    </div>`
  },

  6: {
    name: "SESSION ARCHIVE",
    html: `<div class="page">
      <small>CH 06 · RECORDED SESSIONS</small>
      <h1>THE ROAD<br><em>DOWN</em></h1>
      <p>The archive is arranged by campaign arc. The labels are the names the table actually used when saving the recordings.</p>
      <div class="list">
        <div><span>SESSIONS 01–04</span><b>The Contract at Port Nyanzaru</b></div>
        <div><span>SESSIONS 05–09</span><b>Green Hell</b></div>
        <div><span>SESSIONS 10–13</span><b>The City That Time Forgot</b></div>
        <div><span>SESSIONS 14–17</span><b>Gods in Small Places</b></div>
        <div><span>SESSIONS 18–21</span><b>The Tomb Opens</b></div>
        <div><span>SESSION 22+</span><b>The Last Descent</b></div>
      </div>
    </div>`
  },

  7: {
    name: "ORACLE / OMENS",
    html: `<div class="page">
      <small>CH 07 · SIGNAL INTERCEPT</small>
      <h1>THE<br><em>SOULMONGER</em></h1>
      <p id="omen">TRANSMISSION: STABLE · SOURCE: UNKNOWN · RANGE: INTERNAL</p>
      <div class="box"><b>LAST RECORDED OMEN</b><p>The dead are not resting. The curse is not merely preventing resurrection; something beneath Omu is taking the souls that should have returned to the living. Every day the machine remains active, the number of people who can be restored shrinks.</p></div>
      <div class="box"><b>DM NOTE</b><p>Do not let the table forget that the dungeon is not the real enemy. The Tomb is the lock. The Soulmonger is the weapon. Acererak is the intelligence behind it.</p></div>
    </div>`
  },

  8: {
    name: "JUNGLE FEED",
    html: `<div class="media-page">
      <div class="media-label">CH 08 · FIELD REEL · CHULT</div>
      <h1>GREEN HELL<br><em>ON TAPE</em></h1>
      <div class="media-frame jungle-reel">
        <div class="media-art">
          <span>FIELD REEL 08</span>
          <b>CHULT</b>
          <i>◆</i>
        </div>
      </div>
      <p>Moving-image placeholder intentionally retained as part of the archive aesthetic. The reel represents the expedition's jungle footage: rain, river travel, dinosaurs, undead patrols and ruined stone.</p>
    </div>`
  },

  9: {
    name: "TOMB STILL",
    html: `<div class="media-page">
      <div class="media-label">CH 09 · ARCHIVE STILL · OMU</div>
      <h1>THE DOOR<br><em>BELOW</em></h1>
      <div class="media-frame still tomb-still">
        <div class="media-art">
          <span>ARCHIVE STILL 09</span>
          <b>THE NINE GODS</b>
          <i>◈</i>
        </div>
      </div>
      <p>Still frame from the final expedition record. The party has crossed the threshold and entered the Tomb of the Nine Gods.</p>
    </div>`
  }
};

let currentChannel = 1;
let isPoweredOn = true;
let clockSeconds = 0;
let tapePosition = 0;

const program = document.getElementById("program");
const channelDisplay = document.getElementById("channel");
const remoteChannelDisplay = document.getElementById("remoteCh");
const screen = document.getElementById("screen");
const tapeStatus = document.getElementById("tapeStatus");
const cassetteLabel = document.getElementById("cassetteLabel");
const vcrCounter = document.getElementById("vcrCounter");

function tune(channelNumber) {
  currentChannel = ((channelNumber - 1 + 9) % 9) + 1;

  channelDisplay.textContent = "CH " + String(currentChannel).padStart(2, "0");
  remoteChannelDisplay.textContent = String(currentChannel).padStart(2, "0");

  program.animate(
    [
      { opacity: 1, filter: "blur(0) scale(1)" },
      { opacity: 0, filter: "blur(16px) scale(1.08)" },
      { opacity: 1, filter: "blur(0) scale(1)" }
    ],
    600
  );

  window.setTimeout(() => {
    program.innerHTML = channels[currentChannel].html;
  }, 190);
}

function togglePower() {
  isPoweredOn = !isPoweredOn;

  if (isPoweredOn) {
    screen.classList.remove("off");
    screen.style.visibility = "visible";
    screen.style.opacity = "1";
  } else {
    screen.classList.add("off");
    screen.style.visibility = "hidden";
    screen.style.opacity = "0";
  }

  document.getElementById("power").textContent = isPoweredOn ? "SEAL / AWAKEN" : "AWAKEN";
}

document.querySelectorAll(".numeric [data-ch]").forEach(button => {
  button.addEventListener("click", () => tune(Number(button.dataset.ch)));
});

document.getElementById("chUp").addEventListener("click", () => tune(currentChannel + 1));
document.getElementById("chDown").addEventListener("click", () => tune(currentChannel - 1));
document.getElementById("power").addEventListener("click", togglePower);
document.getElementById("menu").addEventListener("click", () => tune(7));
document.getElementById("input").addEventListener("click", () => tune(6));

const tapeToChannel = {
  tape_01: 1,
  tape_02: 3,
  tape_03: 3,
  tape_04: 4,
  tape_05: 7,
  tape_06: 9
};

document.querySelectorAll(".tapes button").forEach(button => {
  button.addEventListener("click", () => {
    const title = button.querySelector("b").textContent;

    tapeStatus.textContent = "VISION OPEN / " + title.toUpperCase();
    cassetteLabel.textContent = title.toUpperCase();

    document.querySelectorAll(".tapes button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    document.getElementById("cassette").animate(
      [
        { transform: "translateY(10px) scaleX(.96)" },
        { transform: "none" }
      ],
      350
    );

    tune(tapeToChannel[button.dataset.tape] || 1);
    setReelState("running");
  });
});

document.getElementById("play").addEventListener("click", () => {
  tapeStatus.textContent = "FOCUS / " + cassetteLabel.textContent;
  setReelState("running");
});

document.getElementById("stop").addEventListener("click", () => {
  tapeStatus.textContent = "VISION RELEASED";
  setReelState("paused");
});

document.getElementById("rew").addEventListener("click", () => {
  tapeStatus.textContent = "RETURNING VISION";
  setReelDirection("reverse");
  setReelSpeed("2.5s");
});

document.getElementById("ff").addEventListener("click", () => {
  tapeStatus.textContent = "DESCENDING VISION";
  setReelDirection("normal");
  setReelSpeed(".45s");
});

document.getElementById("eject").addEventListener("click", () => {
  tapeStatus.textContent = "NO MEMORY SELECTED";
  cassetteLabel.textContent = "SELECT A MEMORY";
  setReelState("paused");
  document.querySelectorAll(".tapes button").forEach(item => item.classList.remove("active"));
});

function setReelState(state) {
  document.querySelectorAll(".reel").forEach(reel => {
    reel.style.animationPlayState = state;
  });
}

function setReelDirection(direction) {
  document.querySelectorAll(".reel").forEach(reel => {
    reel.style.animationDirection = direction;
  });
}

function setReelSpeed(duration) {
  document.querySelectorAll(".reel").forEach(reel => {
    reel.style.animationDuration = duration;
  });
}

document.getElementById("volUp").addEventListener("click", () => {
  screen.animate(
    [{ filter: "brightness(1)" }, { filter: "brightness(1.5)" }, { filter: "brightness(1)" }],
    250
  );
});

document.getElementById("volDown").addEventListener("click", () => {
  screen.animate(
    [{ filter: "brightness(1)" }, { filter: "brightness(.45)" }, { filter: "brightness(1)" }],
    250
  );
});

document.querySelectorAll(".dpad button").forEach(button => {
  button.addEventListener("click", () => {
    screen.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }],
      220
    );
  });
});

window.setInterval(() => {
  clockSeconds += 1;
  tapePosition += 1;

  const hours = Math.floor(clockSeconds / 3600);
  const minutes = Math.floor(clockSeconds / 60) % 60;
  const seconds = clockSeconds % 60;

  document.getElementById("clock").textContent = [hours, minutes, seconds]
    .map(value => String(value).padStart(2, "0"))
    .join(":");

  const tapeHours = Math.floor(tapePosition / 3600);
  const tapeMinutes = Math.floor(tapePosition / 60) % 60;
  const tapeSeconds = tapePosition % 60;
  vcrCounter.textContent = "TOA-" + [tapeHours, tapeMinutes, tapeSeconds]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}, 1000);

program.innerHTML = channels[1].html;