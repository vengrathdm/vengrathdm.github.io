import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
export function renderChronicleSection(chronicle, accent) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    chronicle.description;
  const container = document.querySelector("#campaign-chronicle");
  container.classList.add("chronicle");
  container.replaceChildren(
    ...chronicle.sessions.map((session) =>
      createChronicleRecord(session, { accent }),
    ),
  );
}
