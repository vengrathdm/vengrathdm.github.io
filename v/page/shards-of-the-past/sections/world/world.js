export function renderWorldSection(world) {
  document.querySelector("#world-kicker").textContent = world.kicker;
  document.querySelector("#world-title").textContent = world.title;
  document.querySelector("#world-description").textContent = world.description;
  const root = document.querySelector("#world-grid");
  root.replaceChildren(
    ...world.sections.map((item) => {
      const panel = document.createElement("article");
      panel.className = "ddc-world-panel";
      const kicker = document.createElement("div");
      kicker.className = "ddc-section-mark";
      kicker.textContent = item.kicker;
      const title = document.createElement("h3");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      panel.append(kicker, title, description);
      return panel;
    }),
  );
}
