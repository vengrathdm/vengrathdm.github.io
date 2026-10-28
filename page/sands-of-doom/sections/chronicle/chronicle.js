import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";

export function renderChronicleSection(chronicle, accent) {
  const container = document.querySelector("#campaign-chronicle");
  container.replaceChildren(
    ...chronicle.sessions.map((session) =>
      createChronicleRecord(session, { accent }),
    ),
  );
}
