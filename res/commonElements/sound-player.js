(() => {
  "use strict";
  function init(options = {}) {
    const audio = typeof options.audio === "string" ? document.getElementById(options.audio) : options.audio;
    const toggle = typeof options.toggle === "string" ? document.getElementById(options.toggle) : options.toggle;
    if (!audio || !toggle) return null;
    const key = options.storageKey || audio.id || "vengrathSound";
    const timeKey = key + ":time", mutedKey = key + ":muted", playingKey = key + ":playing";
    let userMuted = sessionStorage.getItem(mutedKey) === "true";
    let restored = false;
    audio.volume = Number.isFinite(options.volume) ? options.volume : 0.55;

    const save = () => {
      if (!restored) return;
      try {
        sessionStorage.setItem(timeKey, String(audio.currentTime || 0));
        sessionStorage.setItem(mutedKey, String(audio.muted || userMuted));
        sessionStorage.setItem(playingKey, String(!audio.paused && !audio.muted));
      } catch (_) {}
    };
    const sync = () => {
      const playing = !audio.muted && !audio.paused;
      toggle.classList.toggle("is-playing", playing);
      toggle.setAttribute("aria-pressed", String(playing));
      toggle.setAttribute("aria-label", playing ? "Wycisz muzykę" : "Włącz muzykę");
      toggle.title = playing ? "Wycisz muzykę" : "Włącz muzykę";
    };
    const restore = () => {
      if (restored) return;
      const saved = Number.parseFloat(sessionStorage.getItem(timeKey));
      const position = Number.isFinite(saved) && saved >= 0 ? saved : 0;
      if (audio.duration && position >= audio.duration) audio.currentTime = position % audio.duration;
      else if (audio.readyState >= 1) audio.currentTime = position;
      restored = true;
    };
    const start = async () => {
      restore();
      try { audio.muted = userMuted; await audio.play(); }
      catch (_) { audio.muted = true; try { await audio.play(); } catch (_) {} }
      sync(); save();
    };
    audio.addEventListener("loadedmetadata", () => {
      restore();
      if (sessionStorage.getItem(playingKey) !== "false" && !userMuted) start();
      else sync();
    });
    toggle.addEventListener("click", async () => {
      if (audio.paused || audio.muted) {
        userMuted = false;
        try { sessionStorage.setItem(mutedKey, "false"); } catch (_) {}
        await start();
      } else {
        userMuted = true; audio.muted = true; save(); sync();
      }
    });
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", save);
    audio.addEventListener("volumechange", () => { sync(); save(); });
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") save(); });
    document.addEventListener("pointerdown", () => {
      if (!userMuted && (audio.muted || audio.paused)) start();
    }, { passive: true });
    if (audio.readyState >= 1) {
      restore();
      if (sessionStorage.getItem(playingKey) !== "false" && !userMuted) start();
      else sync();
    }
    return { audio, toggle, save, start, sync };
  }
  window.VengrathSoundPlayer = Object.freeze({ init });
})();