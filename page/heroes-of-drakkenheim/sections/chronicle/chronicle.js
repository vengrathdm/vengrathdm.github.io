import { createChronicleRecord } from "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { createInlineYouTubePlayer } from "/core/templates/YouTubeInlinePlayer/YouTubeInlinePlayer.js";

export function renderChronicleSection(chronicle, accent, playlistUrl) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent = chronicle.description;
  const playlist = document.createElement("div");
  playlist.className = "heroes-playlist-wrap";
  const player = createInlineYouTubePlayer({
    url: playlistUrl,
    title: chronicle.title || "Heroes of Drakkenheim",
    label: chronicle.playlistLabel || "ODTWÓRZ PLAYLISTĘ",
    accent,
  });
  if (player) {
    playlist.append(player.button, player.panel);
  } else if (playlistUrl) {
    const link = document.createElement("a");
    link.className = "heroes-playlist-link";
    link.href = playlistUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = chronicle.playlistLabel || "Otwórz playlistę";
    playlist.append(link);
  }
  document.querySelector("#campaign-playlist").replaceChildren(playlist);
  const container = document.querySelector("#campaign-chronicle");
  container.classList.add("chronicle");
  container.replaceChildren(
    ...(chronicle.sessions || []).map((session) =>
      createChronicleRecord(session, { accent }),
    ),
  );
}
