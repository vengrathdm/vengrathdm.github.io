/* Vengrath global pointer — shared Heartwell-style DOM tracking. */
if (!document.querySelector('link[href="/core/templates/Cursor/Cursor.css"]')) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/core/templates/Cursor/Cursor.css";
  document.head.appendChild(stylesheet);
}
(() => {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (!finePointer.matches || document.querySelector(".vengrath-cursor")) return;
  const cursor = document.createElement("span");
  cursor.className = "vengrath-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);
  let frame = 0, x = -100, y = -100;
  document.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("is-visible"); frame = 0;
    });
  }, { passive: true });
  document.addEventListener("pointerover", event => {
    const target = event.target instanceof Element ? event.target : null;
    cursor.classList.toggle("is-hovering", Boolean(target?.closest("a, button, [role='button'], input, textarea, select, summary, label, .cell, .map-pin")));
  });
  document.addEventListener("pointerdown", event => { if (event.pointerType !== "touch") cursor.classList.add("is-pressed"); });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointercancel", () => cursor.classList.remove("is-pressed"));
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
  document.addEventListener("pointerenter", () => cursor.classList.add("is-visible"));
})();