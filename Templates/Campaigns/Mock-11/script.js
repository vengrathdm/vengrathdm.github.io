// Mock 11 — Spatial command table interactions

const panel = document.getElementById("panel");
const carouselTrack = document.querySelector(".carousel-track");

const locationRecords = {
  Location_Name_01: {
    title: "Location_Brief_Title_01",
    description: "This is the field where the actual description of location 01 would go."
  },
  Location_Name_02: {
    title: "Location_Brief_Title_02",
    description: "This is the field where the actual description of location 02 would go."
  },
  Location_Name_03: {
    title: "Location_Brief_Title_03",
    description: "This is the field where the actual description of location 03 would go."
  },
  Location_Name_04: {
    title: "Location_Brief_Title_04",
    description: "This is the field where the actual description of location 04 would go."
  }
};

document.querySelectorAll(".node").forEach(node => {
  node.addEventListener("click", () => {
    const record = locationRecords[node.dataset.name];
    if (!record) return;

    panel.querySelector("h2").textContent = record.title;
    panel.querySelector("p").textContent = record.description;
  });
});

document.querySelector(".prev")?.addEventListener("click", () => {
  carouselTrack.scrollBy({ left: -270, behavior: "smooth" });
});

document.querySelector(".next")?.addEventListener("click", () => {
  carouselTrack.scrollBy({ left: 270, behavior: "smooth" });
});

let isDragging = false;
let dragStartX = 0;
let scrollStart = 0;

carouselTrack.addEventListener("pointerdown", event => {
  isDragging = true;
  dragStartX = event.clientX;
  scrollStart = carouselTrack.scrollLeft;
  carouselTrack.setPointerCapture(event.pointerId);
  carouselTrack.style.cursor = "grabbing";
});

carouselTrack.addEventListener("pointermove", event => {
  if (!isDragging) return;
  carouselTrack.scrollLeft = scrollStart - (event.clientX - dragStartX);
});

carouselTrack.addEventListener("pointerup", () => {
  isDragging = false;
  carouselTrack.style.cursor = "grab";
});

carouselTrack.addEventListener("pointercancel", () => {
  isDragging = false;
  carouselTrack.style.cursor = "grab";
});
