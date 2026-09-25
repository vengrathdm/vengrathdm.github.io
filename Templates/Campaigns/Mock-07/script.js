// Mock 07 — Atlas and party interactions
const locationRecords = {
  location_01: "This is the field where the actual location description would go.",
  location_02: "This is the field where the actual location description would go.",
  location_03: "This is the field where the actual location description would go.",
  location_04: "This is the field where the actual location description would go."
};

document.querySelectorAll(".place").forEach((button, index) => {
  const locationKey = "location_0" + (index + 1);

  button.addEventListener("click", () => {
    document.getElementById("mapNote").textContent = locationRecords[locationKey];
  });
});

const characterRecords = [
  "This is the field where the actual character profile 01 would go.",
  "This is the field where the actual character profile 02 would go.",
  "This is the field where the actual character profile 03 would go.",
  "This is the field where the actual character profile 04 would go.",
  "This is the field where the actual character profile 05 would go."
];

document.querySelectorAll(".party button").forEach((button, index) => {
  button.addEventListener("click", () => {
    document.getElementById("profile").textContent = characterRecords[index];
  });
});
