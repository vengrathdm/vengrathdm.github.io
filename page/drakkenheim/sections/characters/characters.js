export function renderCharactersSection(materials) {
  document.querySelector("#characters-kicker").textContent = materials.kicker;
  document.querySelector("#characters-title").textContent = materials.title;
  document.querySelector("#characters-description").textContent =
    materials.description;
  const card = document.createElement("article");
  card.className = "drakkenheim-material-card";
  const portrait = document.createElement("div");
  portrait.className = "drakkenheim-material-card__portrait";
  const image = document.createElement("img");
  image.src = materials.image;
  image.alt = "Ruiny Drakkenheim";
  image.loading = "lazy";
  const info = document.createElement("div");
  info.className = "drakkenheim-material-card__info";
  const label = document.createElement("div");
  label.className = "drakkenheim-material-card__label";
  label.textContent = materials.artifactLabel;
  const title = document.createElement("strong");
  title.textContent = materials.artifactTitle;
  const description = document.createElement("span");
  description.textContent = materials.artifactDescription;
  info.append(label, title, description);
  portrait.append(image);
  card.append(portrait, info);
  document.querySelector("#archive-material").replaceChildren(card);
}
