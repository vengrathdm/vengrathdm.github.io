export function mountAudioPlayerButton(
  player,
  color = "#bca06a",
  { autoplay = false } = {},
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "audio-player-button";
  button.style.setProperty("--player-color", color);

  const ring = document.createElement("span");
  ring.className = "audio-player-ring";

  const symbol = document.createElement("span");
  symbol.className = "audio-player-symbol";
  button.append(ring, symbol);

  let dragging = false;

  const point = (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    let angle = Math.atan2(y, x) + Math.PI / 2;

    if (angle < 0) angle += Math.PI * 2;

    return {
      radius: Math.hypot(x, y),
      volume: angle / (Math.PI * 2),
    };
  };

  const updateVolume = (event) => player.setVolume(point(event).volume);

  button.addEventListener("click", (event) => {
    if (dragging) {
      event.preventDefault();
      return;
    }

    if (point(event).radius > 18) {
      updateVolume(event);
    } else {
      player.toggle();
    }
  });

  button.addEventListener("pointerdown", (event) => {
    if (point(event).radius <= 18) return;

    event.preventDefault();
    dragging = true;
    button.setPointerCapture(event.pointerId);
    updateVolume(event);
  });

  button.addEventListener("pointermove", (event) => {
    if (dragging) updateVolume(event);
  });

  button.addEventListener("pointerup", () => {
    dragging = false;
  });

  button.addEventListener("pointercancel", () => {
    dragging = false;
  });

  const unsubscribe = player.subscribe((state) => {
    symbol.textContent = state.playing ? "Ⅱ" : "▶";
    button.setAttribute(
      "aria-label",
      state.playing ? "Wstrzymaj audio" : "Odtwórz audio",
    );
    ring.style.setProperty("--volume", state.volume * 100 + "%");
  });

  document.body.append(button);

  if (autoplay) {
    // Browsers may require a user gesture before starting playback.
    player.play();
  }

  return {
    element: button,
    destroy() {
      unsubscribe();
      button.remove();
    },
  };
}
