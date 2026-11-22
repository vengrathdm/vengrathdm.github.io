/* Strahd pointer — desktop only */
(() => {
  const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!media.matches || document.querySelector(".strahd-cursor")) return;

  const cursor = document.createElement("span");
  cursor.className = "strahd-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  let frame = 0, x = 0, y = 0;
  document.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
      cursor.classList.add("is-visible");
      frame = 0;
    });
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    cursor.classList.toggle("is-hovering", Boolean(event.target.closest("a, button, input, select, textarea, [role='button'], summary")));
  });
  document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
})();