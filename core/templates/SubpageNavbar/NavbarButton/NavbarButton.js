export function createNavbarButton({
  color = "#bca06a",
  text = "Kampania",
  sectionLink,
  defaultActive = false,
}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "subpage-navbar-button";
  button.textContent = text;
  button.style.setProperty("--section-color", color);
  button.dataset.section = sectionLink;
  button.setAttribute("aria-pressed", String(defaultActive));
  button.addEventListener("click", () => {
    const event = new CustomEvent("vengrath:sectionchange", {
      bubbles: true,
      detail: { section: sectionLink, button },
    });
    button.dispatchEvent(event);
  });
  return button;
}
