// Mock 04 — Interactive dossier
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalBody = document.getElementById("modalBody");
const modalTag = document.getElementById("modalTag");

const modalRecords = {
  restricted_file_01: {
    tag: "Restricted_File_Type_01",
    title: "Restricted_File_Title_01",
    subtitle: "Restricted_File_Subtitle_01",
    body: "This is the field where the actual restricted file description would go."
  },
  restricted_file_02: {
    tag: "Restricted_File_Type_02",
    title: "Restricted_File_Title_02",
    subtitle: "Restricted_File_Subtitle_02",
    body: "This is the field where the actual restricted file description would go."
  },
  restricted_file_03: {
    tag: "Restricted_File_Type_03",
    title: "Restricted_File_Title_03",
    subtitle: "Restricted_File_Subtitle_03",
    body: "This is the field where the actual restricted file description would go."
  }
};

function openModal(recordKey) {
  const record = modalRecords[recordKey] || modalRecords.restricted_file_01;
  modalTag.textContent = record.tag;
  modalTitle.textContent = record.title;
  modalSubtitle.textContent = record.subtitle;
  modalBody.textContent = record.body;
  modal.setAttribute("aria-hidden", "false");
  modal.classList.add("open");
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("open");
}

document.getElementById("menuButton")?.addEventListener("click", () => {
  document.getElementById("drawer")?.classList.add("open");
});

document.getElementById("closeButton")?.addEventListener("click", () => {
  document.getElementById("drawer")?.classList.remove("open");
});

document.querySelectorAll("[data-scroll]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-modal]").forEach(button => {
  button.addEventListener("click", () => openModal(button.dataset.modal));
});

document.querySelector(".modal-close")?.addEventListener("click", closeModal);
document.querySelector(".modal-backdrop")?.addEventListener("click", closeModal);
