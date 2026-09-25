// Mock 06 — Chronicle thread browser
const threadRecords = {
  thread_01: "This is the field where the actual open thread description would go.",
  thread_02: "This is the field where the actual historical thread description would go.",
  thread_03: "This is the field where the actual faction history would go.",
  thread_04: "This is the field where the actual party thread description would go."
};

document.querySelectorAll(".threads button").forEach((button, index) => {
  const threadKey = "thread_0" + (index + 1);

  button.addEventListener("click", () => {
    document.getElementById("detail").textContent = threadRecords[threadKey];
  });
});
