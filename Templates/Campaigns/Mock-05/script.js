// Mock 05 — Campaign reference tabs
const storyRecords = {
  premise: {
    title: "Story_Title_01",
    text: "This is the field where the actual campaign premise would go."
  },
  history: {
    title: "Story_Title_02",
    text: "This is the field where the actual campaign history would go."
  },
  party: {
    title: "Story_Title_03",
    text: "This is the field where the actual party overview would go."
  },
  conflict: {
    title: "Story_Title_04",
    text: "This is the field where the actual campaign conflict would go."
  }
};

const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");

document.querySelectorAll("[data-k]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-k]").forEach(item => item.classList.remove("on"));
    button.classList.add("on");

    const record = storyRecords[button.dataset.k];
    if (!record) return;

    storyTitle.textContent = record.title;
    storyText.textContent = record.text;
  });
});
