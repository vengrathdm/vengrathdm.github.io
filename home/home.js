import { VoronoiShatter } from "/core/templates/VoronoiShatter/VoronoiShatter.js?v=voronoi-layout-1";
const field = new VoronoiShatter({
  viewport: document.querySelector("#viewport"),
  board: document.querySelector("#board"),
  filters: document.querySelector("#filters"),
  search: document.querySelector("#search"),
  emptyState: document.querySelector("#empty-state"),
  clearFilters: document.querySelector("#clear-filters"),
});
field.mount().catch((error) => {
  console.error(error);
  const message = document.createElement("p");
  message.className = "voronoi-error";
  message.textContent = "Nie udało się wczytać danych kart.";
  document.querySelector("#board").replaceChildren(message);
});
