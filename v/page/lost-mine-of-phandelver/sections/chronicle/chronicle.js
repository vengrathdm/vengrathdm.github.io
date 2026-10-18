export function renderChronicleSection(chronicle,playlistUrl) {
  document.querySelector("#chronicle-kicker").textContent = chronicle.kicker;
  document.querySelector("#chronicle-title").textContent = chronicle.title;
  document.querySelector("#chronicle-description").textContent = chronicle.description;

  const container = document.querySelector("#campaign-chronicle");
  const entry = document.createElement("article");
  entry.className = "lmop-archive-entry";
  const number = document.createElement("span");
  number.className = "lmop-archive-entry__number";
  number.textContent = chronicle.entryNumber;
  const copy = document.createElement("div");
  copy.className = "lmop-archive-entry__copy";
  const title = document.createElement("h3");
  title.textContent = chronicle.entryTitle;
  const description = document.createElement("p");
  description.textContent = chronicle.entryDescription;
  copy.append(title,description);
  const link = document.createElement("a");
  link.className = "lmop-playlist-link";
  link.href = playlistUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = chronicle.playlistLabel;
  entry.append(number,copy,link);
  container.replaceChildren(entry);
}
