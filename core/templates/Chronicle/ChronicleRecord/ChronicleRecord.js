import { createPlayRecordingButton } from "../PlayRecordingButton/PlayRecordingButton.js";
import { createInlineYouTubePlayer } from "../../YouTubeInlinePlayer/YouTubeInlinePlayer.js";

function formatSessionNumber(value) {
  if (value == null || value === "") return "—";
  const raw = String(value).trim();
  const match = raw.match(/^S?0*(\d+)([A-Z]?)$/i);
  if (!match) return raw;
  return String(Number(match[1])).padStart(2, "0") + match[2].toUpperCase();
}

function formatSessionTitle(value) {
  const raw = String(value || "Bez tytułu").trim();
  const normalized = raw
    .replace(/^.*?\bS\d+(?:P\d+)?\s*[-–—:]\s*/i, "")
    .replace(/^.*?#\s*\d+\s*[-–—:]\s*/i, "")
    .replace(/\s+S\d+(?:P\d+)?\s*\[[^\]]+\]$/i, "")
    .trim();
  return normalized || raw;
}

function toDateTime(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : raw;
}

export function createChronicleRecord(session, { accent = "#bca06a" } = {}) {
  const article = document.createElement("article");
  article.className = "chronicle-record";
  article.style.setProperty("--chronicle-accent", accent);

  const header = document.createElement("div");
  header.className = "chronicle-record__header";
  header.tabIndex = 0;
  header.setAttribute("role", "button");
  header.setAttribute("aria-expanded", "false");

  const numberValue = session.sessionNumber ?? session.number;
  const formattedNumber = formatSessionNumber(numberValue);
  const titleValue = formatSessionTitle(session.title);

  const number = document.createElement("span");
  number.className = "chronicle-record__number";
  number.textContent = formattedNumber;

  const title = document.createElement("span");
  title.className = "chronicle-record__title";
  title.textContent = titleValue;

  const date = document.createElement("time");
  date.className = "chronicle-record__date";
  date.hidden = !session.date;
  if (session.date) {
    date.dateTime = toDateTime(session.date);
    date.textContent = session.date;
  }

  const recordings = document.createElement("div");
  recordings.className = "chronicle-record__recordings";
  const links = Array.isArray(session.recordings) ? session.recordings : [];
  recordings.hidden = links.length === 0;

  const players = document.createElement("div");
  players.className = "chronicle-record__players";
  links.forEach((recording, index) => {
    const partNumber = recording.partNumber || (links.length > 1 ? index + 1 : null);
    const label =
      links.length > 1 ? "Odtwórz Część " + (partNumber || index + 1) : "Odtwórz";
    const player = createInlineYouTubePlayer({
      url: recording.url,
      title: titleValue,
      sessionNumber: formattedNumber,
      partNumber,
      label,
      accent,
    });
    if (player) {
      recordings.append(player.button);
      players.append(player.panel);
    } else if (recording.url) {
      recordings.append(createPlayRecordingButton({ url: recording.url, label }));
    }
  });
  recordings.addEventListener("click", (event) => event.stopPropagation());

  header.append(number, title, date, recordings);

  const description = document.createElement("div");
  description.className = "chronicle-record__description";
  description.hidden = true;
  const text = document.createElement("p");
  text.textContent = session.description || session.notes || "";
  description.append(text);

  const toggle = () => {
    const open = description.hidden;
    description.hidden = !open;
    header.setAttribute("aria-expanded", String(open));
    article.classList.toggle("is-expanded", open);
  };

  header.addEventListener("click", toggle);
  header.addEventListener("keydown", (event) => {
    if (
      event.target === header &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      toggle();
    }
  });

  article.append(header, players, description);
  return article;
}
