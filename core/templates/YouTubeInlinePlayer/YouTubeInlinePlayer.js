let activePlayerClose = null;
let playerSequence = 0;

function getYouTubeTarget(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return { videoId: url.pathname.split("/").filter(Boolean)[0] || null };
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const videoId = url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || null;
      const playlistId = url.searchParams.get("list");
      if (videoId) return { videoId, playlistId };
      if (playlistId) return { playlistId };
    }
  } catch { return null; }
  return null;
}

function ensureStyles() {
  if (document.querySelector('link[data-chronicle-inline-player]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.css";
  link.dataset.chronicleInlinePlayer = "true";
  document.head.append(link);
}

export function createInlineYouTubePlayer({ url, title = "Nagranie sesji", sessionNumber = "", label = "ODTWÓRZ", partNumber = null, accent = null } = {}) {
  const target = getYouTubeTarget(url);
  if (!target?.videoId && !target?.playlistId) return null;
  ensureStyles();

  const button = document.createElement("button");
  button.type = "button";
  button.className = "chronicle-inline-player__toggle";
  button.textContent = label;
  button.setAttribute("aria-expanded", "false");

  const panel = document.createElement("section");
  panel.className = "chronicle-inline-player";
  panel.hidden = true;
  if (accent) panel.style.setProperty("--inline-player-accent", accent);
  panel.id = "chronicle-inline-player-" + ++playerSequence;
  button.setAttribute("aria-controls", panel.id);

  const header = document.createElement("header");
  header.className = "chronicle-inline-player__header";
  const heading = document.createElement("strong");
  heading.className = "chronicle-inline-player__title";
  heading.textContent = title;
  const tag = document.createElement("span");
  tag.className = "chronicle-inline-player__tag";
  tag.textContent = target.playlistId && !target.videoId ? "PLAYLISTA · YOUTUBE" : "NAGRANIE · YOUTUBE";
  header.append(heading, tag);

  const video = document.createElement("div");
  video.className = "chronicle-inline-player__video";
  const footer = document.createElement("footer");
  footer.className = "chronicle-inline-player__footer";
  const meta = document.createElement("span");
  meta.textContent = (sessionNumber ? "SESJA " + sessionNumber : "NAGRANIE") + (partNumber ? " · CZĘŚĆ " + partNumber : "");
  const external = document.createElement("a");
  external.href = url;
  external.target = "_blank";
  external.rel = "noopener noreferrer";
  external.textContent = "OTWÓRZ W YOUTUBE ↗";
  footer.append(meta, external);
  panel.append(header, video, footer);

  const close = () => {
    video.replaceChildren();
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.textContent = label;
    if (activePlayerClose === close) activePlayerClose = null;
  };
  button.addEventListener("click", event => {
    event.stopPropagation();
    if (!panel.hidden) { close(); return; }
    if (activePlayerClose) activePlayerClose();
    const iframe = document.createElement("iframe");
    iframe.src = target.videoId
      ? "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(target.videoId) + (target.playlistId ? "?list=" + encodeURIComponent(target.playlistId) + "&rel=0" : "?rel=0")
      : "https://www.youtube-nocookie.com/embed/videoseries?list=" + encodeURIComponent(target.playlistId);
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    video.replaceChildren(iframe);
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    button.textContent = "ZAMKNIJ";
    activePlayerClose = close;
  });
  return { button, panel };
}
