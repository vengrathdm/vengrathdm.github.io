// Mock 10 — Surveillance interface interactions

const clock = document.getElementById("clock");
const frame = document.getElementById("frame");
const cameraTime = document.getElementById("camTime");
const cameraName = document.getElementById("camName");
const feedCopy = document.getElementById("feedCopy");
const footerMessage = document.getElementById("footerMsg");
const entityName = document.getElementById("entityName");
const integrity = document.getElementById("integrity");
const trackingLabel = document.querySelector(".tracking-box span");
const trackingStatus = document.querySelector(".tracking-box b");
const feedImage = document.querySelector(".feed-image");
const portrait = document.querySelector(".portrait");

let frameNumber = 19482;
let integrityValue = 62;
let currentFeed = "feed_01";
let logCounter = 0;

const feedRecords = {
  feed_01: {
    name: "Feed_Name_01",
    message: "This is the field where the actual feed event description would go.",
    entity: "Entity_Name_01",
    status: "Status_Value_01"
  },
  feed_02: {
    name: "Feed_Name_02",
    message: "This is the field where the actual feed event description would go.",
    entity: "Entity_Name_02",
    status: "Status_Value_02"
  },
  feed_03: {
    name: "Feed_Name_03",
    message: "This is the field where the actual feed event description would go.",
    entity: "Entity_Name_03",
    status: "Status_Value_03"
  },
  feed_04: {
    name: "Feed_Name_04",
    message: "This is the field where the actual feed event description would go.",
    entity: "Entity_Name_04",
    status: "Status_Value_04"
  },
  feed_05: {
    name: "Feed_Name_05",
    message: "This is the field where the actual compromised-feed description would go.",
    entity: "Entity_Name_05",
    status: "SIGNAL_UNRESOLVED"
  }
};

function updateClock() {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  clock.textContent = time;
  cameraTime.textContent = time;

  frameNumber += Math.floor(Math.random() * 3) + 1;
  frame.textContent = String(frameNumber).padStart(6, "0");
}

function triggerGlitch(duration = 300) {
  document.body.classList.add("glitch");
  window.setTimeout(() => document.body.classList.remove("glitch"), duration);
}

function addLog(message, alert = false) {
  const log = document.getElementById("log");
  logCounter += 1;

  log.insertAdjacentHTML(
    "afterbegin",
    `<p class="${alert ? "alert" : ""}"><time>${clock.textContent}</time>${message}</p>`
  );

  const entries = log.querySelectorAll("p");
  if (entries.length > 6) entries[entries.length - 1].remove();
}

function selectFeed(feedId) {
  const record = feedRecords[feedId];
  if (!record) return;

  currentFeed = feedId;

  document.querySelectorAll(".cam").forEach(button => {
    button.classList.toggle("active", button.dataset.cam === feedId);
  });

  cameraName.textContent = record.name;
  feedCopy.textContent = record.message;
  entityName.textContent = record.entity;
  trackingLabel.textContent = "Entity_Selected";
  trackingStatus.textContent = record.status;

  if (feedId === "feed_05") {
    footerMessage.textContent = "SIGNAL_SOURCE_UNRESOLVED";
    integrityValue = Math.max(41, integrityValue - 2);
  } else {
    footerMessage.textContent = "FEED_LOCKED";
  }

  integrity.textContent = integrityValue + "%";
  addLog("Feed_Selected: " + record.name, feedId === "feed_05");
  triggerGlitch(420);

  feedImage.animate(
    [
      { transform: "scale(1)", filter: "brightness(.8)" },
      { transform: "scale(1.025)", filter: "brightness(1.35)" },
      { transform: "scale(1)", filter: "brightness(.8)" }
    ],
    420
  );
}

document.querySelectorAll(".cam").forEach(button => {
  button.addEventListener("click", () => selectFeed(button.dataset.cam));
});

document.querySelectorAll(".party-grid button").forEach(button => {
  button.addEventListener("click", () => {
    const selectedEntity = button.dataset.person;

    entityName.textContent = selectedEntity;
    trackingLabel.textContent = "ENTITY_REGISTERED";
    trackingStatus.textContent = "TRACKING_LOCKED";
    footerMessage.textContent = "ENTITY_SELECTED";

    addLog("Entity_Register_Selected: " + selectedEntity);
    triggerGlitch(280);

    portrait.animate(
      [
        { transform: "scale(.85) rotate(-4deg)", opacity: .35 },
        { transform: "scale(1.08) rotate(2deg)", opacity: 1 },
        { transform: "scale(1) rotate(0)", opacity: 1 }
      ],
      360
    );
  });
});

document.querySelectorAll(".entity-tabs button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".entity-tabs button").forEach(tab => tab.classList.remove("selected"));
    button.classList.add("selected");
    footerMessage.textContent = "TAB_SELECTED";
    triggerGlitch(180);
  });
});

setInterval(() => {
  if (Math.random() < .09) {
    integrityValue = Math.max(41, integrityValue - 1);
    integrity.textContent = integrityValue + "%";
    footerMessage.textContent = "INTEGRITY_FLUCTUATION";
  }
}, 1800);

window.setInterval(updateClock, 1000);
updateClock();
