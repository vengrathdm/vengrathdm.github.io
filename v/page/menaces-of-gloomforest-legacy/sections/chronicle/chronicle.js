export function renderChronicleSection(chronicle) {
  const container = document.querySelector("#chronicle-section-content");
  const intro = document.createElement("section");
  intro.className = "ddc-section ddc-chronicle-intro";

  const kicker = document.createElement("div");
  kicker.className = "ddc-section-mark";
  kicker.textContent = chronicle.kicker;
  const title = document.createElement("h2");
  title.textContent = chronicle.title;
  const description = document.createElement("p");
  description.textContent = chronicle.description;
  intro.append(kicker, title, description);

  const playlist = document.createElement("a");
  playlist.className = "ddc-playlist-link";
  playlist.href = chronicle.playlistUrl;
  playlist.target = "_blank";
  playlist.rel = "noopener noreferrer";
  playlist.textContent = chronicle.playlistLabel;
  const playlistSection = document.createElement("section");
  playlistSection.className = "ddc-section ddc-playlist-panel";
  playlistSection.append(playlist);

  container.replaceChildren(intro, playlistSection);
}
