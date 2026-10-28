export function createHomeButton() {
  const link = document.createElement("a");
  link.className = "vengrath-home-button";
  link.href = "/home/";
  link.setAttribute("aria-label", "Vengrath — strona główna");
  const image = document.createElement("img");
  image.src = "/core/graphics/favicon/favicon.ico";
  image.alt = "";
  const text = document.createElement("span");
  text.textContent = "VENGRATH";
  link.append(image, text);
  return link;
}
