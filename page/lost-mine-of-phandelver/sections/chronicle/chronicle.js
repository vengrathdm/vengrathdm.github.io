import { createInlineYouTubePlayer } from "/core/templates/YouTubeInlinePlayer/YouTubeInlinePlayer.js";

export function renderChronicleSection(chronicle, playlistUrl) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent = chronicle.description;

  const container = document.querySelector("#campaign-chronicle");
  const entry = document.createElement("article");
  entry.className = "lmop-archive-entry";
  const header = document.createElement("div");
  header.className = "lmop-archive-entry__header";

  const number = document.createElement("span");
  number.className = "lmop-archive-entry__number";
  number.textContent = String(chronicle.entryNumber || "—").replace(/^S0*/i, "").padStart(2, "0");

  const title = document.createElement("h3");
  title.className = "lmop-archive-entry__title";
  title.textContent = chronicle.entryTitle || "Bez tytułu";

  const date = document.createElement("time");
  date.className = "lmop-archive-entry__date";
  date.hidden = !chronicle.entryDate;
  if (chronicle.entryDate) {
    date.dateTime = chronicle.entryDate;
    date.textContent = chronicle.entryDate;
  }

  const links = document.createElement("div");
  links.className = "lmop-archive-entry__links";
  const players = document.createElement("div");
  players.className = "chronicle-record__players";
  const player = createInlineYouTubePlayer({
    url: playlistUrl,
    title: chronicle.title || "Nagrania kampanii",
    sessionNumber: number.textContent,
    label: chronicle.playlistLabel || "ODTWÓRZ PLAYLISTĘ",
    accent: getComputedStyle(document.documentElement).getPropertyValue("--theme-accent-2").trim(),
  });
  if (player) {
    links.append(player.button);
    players.append(player.panel);
  } else if (playlistUrl) {
    const link = document.createElement("a");
    link.className = "lmop-playlist-link";
    link.href = playlistUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = chronicle.playlistLabel || "OTWÓRZ PLAYLISTĘ →";
    links.append(link);
  }
  header.append(number, title, date, links);

  const description = document.createElement("p");
  description.className = "lmop-archive-entry__description";
  description.textContent = chronicle.entryDescription || "";
  entry.append(header, players, description);
  container.replaceChildren(entry);
}
