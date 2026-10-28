export function createPlayRecordingButton({ url, label = "Odtwórz" }) {
  const link = document.createElement("a");
  link.className = "play-recording-button";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.addEventListener("click", (event) => event.stopPropagation());
  const text = document.createElement("span");
  text.textContent = label;
  const icon = document.createElement("span");
  icon.className = "play-recording-button__icon";
  icon.textContent = "▶";
  icon.setAttribute("aria-hidden", "true");
  link.append(text, icon);
  return link;
}
