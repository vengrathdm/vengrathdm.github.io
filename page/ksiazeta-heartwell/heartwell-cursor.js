/* HEARTWELL CUSTOM POINTER — shared across the main page and every sub-page */
(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!finePointer.matches || document.querySelector(".heartwell-cursor")) return;
  const cursor = document.createElement("span");
  cursor.className = "heartwell-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  let frame = 0, x = -100, y = -100;
  document.addEventListener("pointermove", event => {
    x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("is-visible"); frame = 0;
    });
  }, { passive: true });
  document.addEventListener("pointerover", event => {
    cursor.classList.toggle("is-hovering", Boolean(event.target.closest("a, button, [role='button'], input, textarea, select, summary, label")));
  });
  document.addEventListener("pointerdown", () => cursor.classList.add("is-pressed"));
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
})();
