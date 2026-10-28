import { createHomeButton } from "../HomeButton/HomeButton.js";
import { createYouTubePlaylistButton } from "../YouTubePlaylistButton/YouTubePlaylistButton.js";
import { createNavbarButton } from "./NavbarButton/NavbarButton.js";

const SCROLLED_CLASS = "is-scrolled";
const SCROLL_THRESHOLD = 12;

export function mountSubpageNavbar(
  container,
  { playlistUrl = null, sections = [] } = {},
) {
  container.classList.add("subpage-navbar");

  const left = document.createElement("div");
  left.className = "subpage-navbar__left";
  left.append(createHomeButton());

  if (playlistUrl) {
    left.append(createYouTubePlaylistButton(playlistUrl));
  }

  const right = document.createElement("nav");
  right.className = "subpage-navbar__sections";
  right.setAttribute("aria-label", "Sekcje kampanii");

  const buttons = sections.map((section, index) =>
    createNavbarButton({
      ...section,
      defaultActive: index === 0,
    }),
  );

  buttons.forEach((button) => right.append(button));
  container.replaceChildren(left, right);

  const updateScrollState = () => {
    container.classList.toggle(
      SCROLLED_CLASS,
      window.scrollY > SCROLL_THRESHOLD,
    );
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const select = (sectionId) => {
    document.querySelectorAll("[data-page-section]").forEach((section) => {
      section.hidden = section.dataset.pageSection !== sectionId;
    });

    container.dispatchEvent(
      new CustomEvent("vengrath:sectionchange", {
        bubbles: true,
        detail: { section: sectionId },
      }),
    );

    buttons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.section === sectionId),
      );
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => select(button.dataset.section));
  });

  if (buttons[0]) {
    select(buttons[0].dataset.section);
  }

  return {
    select,
    destroy() {
      window.removeEventListener("scroll", updateScrollState);
      container.replaceChildren();
      container.classList.remove(SCROLLED_CLASS);
    },
  };
}
