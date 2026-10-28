import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";

export function renderChronicleSection(chronicle, accent, playlistUrl) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent =
    chronicle.description;
  const playlist = document.createElement("p");
  playlist.className = "heroes-playlist-wrap";
  const link = document.createElement("a");
  link.className = "heroes-playlist-link";
  link.href = playlistUrl;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = chronicle.playlistLabel;
  playlist.append(link);
  document.querySelector("#campaign-playlist").replaceChildren(playlist);
  const container = document.querySelector("#campaign-chronicle");
  container.classList.add("chronicle");
  container.replaceChildren(
    ...chronicle.sessions.map((session) =>
      createChronicleRecord(session, { accent }),
    ),
  );
}
