export class AudioPlayer {
  constructor({
    src,
    storageKey = "vengrath-audio-state",
    preload = "metadata",
  }) {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = preload;
    this.audio.src = src;
    this.storageKey = storageKey;
    this.listeners = new Set();
    this.audio.volume = 0.5;
    this.restore();

    ["play", "pause", "volumechange", "timeupdate", "loadedmetadata"].forEach(
      (type) => {
        this.audio.addEventListener(type, () => {
          if (type === "loadedmetadata" && this.pendingTime > 0) {
            this.audio.currentTime = Math.min(
              this.pendingTime,
              this.audio.duration || this.pendingTime,
            );
          }

          this.persist();
          this.emit();
        });
      },
    );

    window.addEventListener("pagehide", () => this.persist());
  }

  restore() {
    try {
      const state = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
      this.audio.volume = Math.max(0, Math.min(1, Number(state.volume ?? 0.5)));
      this.pendingTime = Math.max(0, Number(state.time) || 0);
    } catch {
      this.pendingTime = 0;
    }
  }

  persist() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          volume: this.audio.volume,
          time: this.audio.currentTime || 0,
        }),
      );
    } catch {
      // Storage can be unavailable in private browsing or restricted contexts.
    }
  }

  snapshot() {
    return {
      playing: !this.audio.paused,
      volume: this.audio.volume,
      time: this.audio.currentTime || 0,
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  emit() {
    const state = this.snapshot();
    this.listeners.forEach((listener) => listener(state));
  }

  async play() {
    try {
      await this.audio.play();
    } catch (error) {
      // Browsers may block audible autoplay until the visitor interacts.
      if (error?.name !== "NotAllowedError") {
        console.error("Audio playback could not start.", error);
      }
    }

    this.emit();
  }

  async toggle() {
    if (this.audio.paused) {
      await this.play();
    } else {
      this.audio.pause();
      this.emit();
    }
  }

  setVolume(value) {
    this.audio.volume = Math.max(0, Math.min(1, value));
    this.persist();
    this.emit();
  }

  destroy() {
    this.persist();
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.listeners.clear();
  }
}
