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

let frameNumber = 0;
let integrityValue = 100;

const feedRecords = {
  feed_01: { name: "Feed_Name_01", message: "This is the field where the actual feed event description would go." },
  feed_02: { name: "Feed_Name_02", message: "This is the field where the actual feed event description would go." },
  feed_03: { name: "Feed_Name_03", message: "This is the field where the actual feed event description would go." },
  feed_04: { name: "Feed_Name_04", message: "This is the field where the actual feed event description would go." },
  feed_05: { name: "Feed_Name_05", message: "This is the field where the actual feed event description would go." }
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

document.querySelectorAll(".cam").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".cam").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    const record = feedRecords[button.dataset.cam];
    if (!record) return;

    cameraName.textContent = record.name;
    feedCopy.textContent = record.message;
    footerMessage.textContent = "Feed_Selected";
    triggerGlitch(420);
  });
});

document.querySelectorAll(".party-grid button").forEach(button => {
  button.addEventListener("click", () => {
    const selectedEntity = button.dataset.person;

    entityName.textContent = selectedEntity;
    trackingLabel.textContent = "Entity_Selected";
    footerMessage.textContent = "Entity_Selected";

    document.querySelector(".log").insertAdjacentHTML(
      "afterbegin",
      `<p><time>${clock.textContent}</time> Entity_Selected</p>`
    );

    const entries = document.querySelectorAll(".log p");
    if (entries.length > 6) entries[entries.length - 1].remove();

    triggerGlitch(280);
  });
});

window.setInterval(updateClock, 1000);
updateClock();

window.setInterval(() => {
  if (Math.random() < 0.09) {
    integrityValue = Math.max(0, integrityValue - 1);
    integrity.textContent = integrityValue + "%";
    footerMessage.textContent = "Integrity_Fluctuation";
  }
}, 1800);
