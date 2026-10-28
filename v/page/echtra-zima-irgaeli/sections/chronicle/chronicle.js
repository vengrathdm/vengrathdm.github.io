import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
export function renderChronicleSection(c, accent) {
  document.querySelector("#chronicle-kicker").textContent = c.kicker;
  document.querySelector("#chronicle-title").textContent = c.title;
  document.querySelector("#chronicle-description").textContent = c.description;
  const root = document.querySelector("#campaign-chronicle");
  root.classList.add("chronicle");
  root.replaceChildren(
    ...c.sessions.map((s) => createChronicleRecord(s, { accent })),
  );
}
