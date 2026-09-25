// Mock 12 — Interactive television template

const channels = {
  1: {
    name: "Channel_Name_01",
    html: `<div class="page">
      <small>Channel_Label_01</small>
      <h1>Channel_Title_01<br><em>Channel_Subtitle_01</em></h1>
      <p>This is the field where the actual channel introduction would go.</p>
      <div class="grid2">
        <div class="box"><b>Metric_Label_01</b><div class="bar"><i></i></div><p>This is the field where the actual metric description would go.</p></div>
        <div class="box"><b>Metric_Label_02</b><p>Metric_Value_01 · Metric_Value_02 · Metric_Value_03</p></div>
      </div>
    </div>`
  },
  2: {
    name: "Channel_Name_02",
    html: `<div class="page">
      <small>Channel_Label_02</small>
      <h1>Channel_Title_02<br><em>Channel_Subtitle_02</em></h1>
      <p>This is the field where the actual historical overview would go.</p>
      <div class="list">
        <div><span>Timeline_Label_01</span><b>Timeline_Value_01</b></div>
        <div><span>Timeline_Label_02</span><b>Timeline_Value_02</b></div>
        <div><span>Timeline_Label_03</span><b>Timeline_Value_03</b></div>
      </div>
    </div>`
  },
  3: {
    name: "Channel_Name_03",
    html: `<div class="page">
      <small>Channel_Label_03</small>
      <h1>Channel_Title_03<br><em>Channel_Subtitle_03</em></h1>
      <p>This is the field where the actual world overview would go.</p>
      <div class="grid2">
        <div class="box"><b>Location_Name_01</b><p>This is the field where the actual location description would go.</p></div>
        <div class="box"><b>Location_Name_02</b><p>This is the field where the actual location description would go.</p></div>
        <div class="box"><b>Location_Name_03</b><p>This is the field where the actual location description would go.</p></div>
        <div class="box"><b>Location_Name_04</b><p>This is the field where the actual location description would go.</p></div>
      </div>
    </div>`
  },
  4: {
    name: "Channel_Name_04",
    html: `<div class="page">
      <small>Channel_Label_04</small>
      <h1>Channel_Title_04<br><em>Channel_Subtitle_04</em></h1>
      <div class="list">
        <div><span>Character_Index_01</span><b>Character_Name_01 / Character_Player_01</b></div>
        <div><span>Character_Index_02</span><b>Character_Name_02 / Character_Player_02</b></div>
        <div><span>Character_Index_03</span><b>Character_Name_03 / Character_Player_03</b></div>
        <div><span>Character_Index_04</span><b>Character_Name_04 / Character_Player_04</b></div>
        <div><span>Character_Index_05</span><b>Character_Name_05 / Character_Player_05</b></div>
      </div>
    </div>`
  },
  5: {
    name: "Channel_Name_05",
    html: `<div class="page">
      <small>Channel_Label_05</small>
      <h1>Channel_Title_05<br><em>Channel_Subtitle_05</em></h1>
      <p>This is the field where the actual DM-facing notes or private campaign feed would go.</p>
      <div class="box"><b>Thread_List_Title</b><p>This is the field where the actual open-thread summary would go.</p></div>
    </div>`
  },
  6: {
    name: "Channel_Name_06",
    html: `<div class="page">
      <small>Channel_Label_06</small>
      <h1>Channel_Title_06<br><em>Channel_Subtitle_06</em></h1>
      <p>This is the field where the actual session archive introduction would go.</p>
      <div class="list">
        <div><span>Session_Number_01</span><b>Session_Title_01</b></div>
        <div><span>Session_Number_02</span><b>Session_Title_02</b></div>
        <div><span>Session_Number_03</span><b>Session_Title_03</b></div>
      </div>
    </div>`
  },
  7: {
    name: "Channel_Name_07",
    html: `<div class="page">
      <small>Channel_Label_07</small>
      <h1>Channel_Title_07<br><em>Channel_Subtitle_07</em></h1>
      <p id="omen">Transmission_Status_01</p>
      <div class="box"><b>Generator_Title_01</b><p>This is the field where the actual generated transmission or omen would go.</p></div>
    </div>`
  },
  8: {
    name: "Channel_Name_08",
    html: `<div class="media-page">
      <div class="media-label">Channel_Label_08</div>
      <h1>Channel_Title_08<br><em>Channel_Subtitle_08</em></h1>
      <div class="media-frame"><img src="https://placehold.co/1200x800?text=Moving_Image_08" alt="Moving_Image_Alt_08"></div>
      <p>This is the field where the actual external moving-image description would go.</p>
    </div>`
  },
  9: {
    name: "Channel_Name_09",
    html: `<div class="media-page">
      <div class="media-label">Channel_Label_09</div>
      <h1>Channel_Title_09<br><em>Channel_Subtitle_09</em></h1>
      <div class="media-frame still"><img src="https://placehold.co/1200x800?text=Archive_Image_09" alt="Archive_Image_Alt_09"></div>
      <p>This is the field where the actual external image description would go.</p>
    </div>`
  }
};

let currentChannel = 1;
let isPoweredOn = true;
let clockSeconds = 0;

const program = document.getElementById("program");
const channelDisplay = document.getElementById("channel");
const remoteChannelDisplay = document.getElementById("remoteCh");
const screen = document.getElementById("screen");
const remote = document.querySelector(".remote");
const tapeStatus = document.getElementById("tapeStatus");
const cassetteLabel = document.getElementById("cassetteLabel");

function tune(channelNumber) {
  currentChannel = ((channelNumber - 1 + 9) % 9) + 1;

  channelDisplay.textContent = "CH " + String(currentChannel).padStart(2, "0");
  remoteChannelDisplay.textContent = String(currentChannel).padStart(2, "0");

  program.animate(
    [
      { opacity: 1, filter: "blur(0)" },
      { opacity: 0, filter: "blur(12px) scaleX(1.05)" },
      { opacity: 1, filter: "blur(0)" }
    ],
    500
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

  document.getElementById("power").textContent =
    isPoweredOn ? "Power_Label" : "Power_On_Label";
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
  tape_02: 2,
  tape_03: 2,
  tape_04: 3,
  tape_05: 4,
  tape_06: 6
};

document.querySelectorAll(".tapes button").forEach(button => {
  button.addEventListener("click", () => {
    const title = button.querySelector("b").textContent;

    tapeStatus.textContent = "Playing / " + title;
    cassetteLabel.textContent = title;

    document.getElementById("cassette").animate(
      [
        { transform: "translateY(10px) scaleX(.96)" },
        { transform: "none" }
      ],
      350
    );

    tune(tapeToChannel[button.dataset.tape] || 1);
  });
});

document.getElementById("play").addEventListener("click", () => {
  tapeStatus.textContent = "Play / " + cassetteLabel.textContent;
  setReelState("running");
});

document.getElementById("stop").addEventListener("click", () => {
  tapeStatus.textContent = "Stop";
  setReelState("paused");
});

document.getElementById("rew").addEventListener("click", () => {
  tapeStatus.textContent = "Rewind";
  setReelDirection("reverse");
});

document.getElementById("ff").addEventListener("click", () => {
  tapeStatus.textContent = "Fast_Forward";
  setReelSpeed(".45s");
});

document.getElementById("eject").addEventListener("click", () => {
  tapeStatus.textContent = "No_Tape_Status";
  cassetteLabel.textContent = "Cassette_Prompt";
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

  const hours = Math.floor(clockSeconds / 3600);
  const minutes = Math.floor(clockSeconds / 60) % 60;
  const seconds = clockSeconds % 60;

  document.getElementById("clock").textContent = [hours, minutes, seconds]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}, 1000);

program.innerHTML = channels[1].html;
