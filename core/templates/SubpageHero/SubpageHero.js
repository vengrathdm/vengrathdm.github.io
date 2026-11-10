export function createSubpageHero({
  title,
  heroImage,
  backgroundImage = null,
  theme = {},
}) {
  const hero = document.createElement("header");
  hero.className = "subpage-hero";
  hero.style.setProperty("--campaign-accent", theme.accent || "#bca06a");
  document.body.classList.add("campaign-fonts-loading");

  // Keep the hero copy out of the first paint until its final web fonts are ready.
  const revealHeroCopyWhenFontsAreReady = () => {
    if (!hero.isConnected) return false;
    const copy = hero.querySelector(".subpage-hero__copy");
    if (!copy) return false;
    observer.disconnect();
    const rootStyle = getComputedStyle(document.documentElement);
    const themeFontRequests = ["--theme-font-1", "--theme-font-2", "--theme-font-3"]
      .map((property) => rootStyle.getPropertyValue(property).trim())
      .filter(Boolean)
      .map((family) =>
        document.fonts.load("400 16px " + family, "Vengrath 0123456789"),
      );
    const heroFontRequests = [...copy.querySelectorAll("*")]
      .filter((element) => element.textContent.trim())
      .map((element) => {
        const style = getComputedStyle(element);
        return document.fonts.load(style.font, element.textContent);
      });
    const fontRequests = [...themeFontRequests, ...heroFontRequests];
    Promise.all(fontRequests)
      .then(() => document.fonts.ready)
      .then(() => {
        copy.style.visibility = "visible";
        document.body.classList.remove("campaign-fonts-loading");
      })
      .catch((error) => {
        console.warn("Hero font loading failed; showing fallback typography.", error);
        copy.style.visibility = "visible";
        document.body.classList.remove("campaign-fonts-loading");
      });
    return true;
  };
  const observer = new MutationObserver(revealHeroCopyWhenFontsAreReady);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (backgroundImage)
    hero.style.setProperty("--hero-background", "url(" + backgroundImage + ")");
  const copy = document.createElement("div");
  copy.className = "subpage-hero__copy";
  copy.style.visibility = "hidden";
  const heading = document.createElement("h1");
  heading.textContent = title || "Kampania";
  copy.append(heading);
  if (heroImage) {
    const image = document.createElement("img");
    image.className = "subpage-hero__image";
    image.src = heroImage;
    image.alt = "";
    image.loading = "eager";
    copy.append(image);
  }
  hero.append(copy);
  return hero;
}
