(() => {
  "use strict";
  const DATA_URL = "../res/achievements.json";
  const $ = id => document.getElementById(id);
  const normalize = value => String(value ?? "").trim().toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const CATEGORY_LABELS = {
    "Walka": "Walka",
    "Eksploracja": "Eksploracja",
    "Odgrywanie Roli": "Odgrywanie Roli",
    "Kamienie Milowe": "Kamienie Milowe",
    "Specjalne": "Specjalne"
  };
  const categoryLabel = category => CATEGORY_LABELS[category] || "Inne";
  let achievements = [];
  function render() {
    const query = normalize($("achievementSearch").value);
    const category = $("categoryFilter").value;
    const filtered = achievements.filter(item => {
      const haystack = normalize([item.name,item.description,categoryLabel(item.category),item.id].join(" "));
      return (!query || haystack.includes(query)) && (!category || item.category === category);
    });
    $("achievementGrid").innerHTML = filtered.map(item =>
      '<article class="achievement-catalogue-card">' +
        '<div class="achievement-catalogue-icon" aria-hidden="true">' + escapeHtml(item.icon) + '</div>' +
        '<div class="achievement-catalogue-copy">' +
          '<h3>' + escapeHtml(item.name) + '</h3>' +
          '<p>' + escapeHtml(item.description) + '</p>' +
          '<div class="achievement-catalogue-tags"><span>' + escapeHtml(categoryLabel(item.category)) + '</span>' +
          (item.rarity ? '<span>' + escapeHtml(item.rarity) + '</span>' : '') + '</div>' +
        '</div>' +
      '</article>'
    ).join("");
    $("achievementCount").textContent = filtered.length + " / " + achievements.length;
    $("achievementEmpty").hidden = filtered.length > 0;
  }
  async function init() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Katalog osiągnięć nie zawiera tablicy.");
      const ids = new Set();
      data.forEach(item => {
        if (!item.id || !item.name || !item.icon || !item.description || !item.category) throw new Error("Niekompletna definicja osiągnięcia: " + (item.id || "(brak ID)"));
        if (ids.has(item.id)) throw new Error("Powtórzone ID osiągnięcia: " + item.id);
        ids.add(item.id);
      });
      achievements = data.slice().sort((a,b) => categoryLabel(a.category).localeCompare(categoryLabel(b.category),"pl") || a.name.localeCompare(b.name,"pl"));
      [...new Set(achievements.map(item => item.category))].sort((a,b) => categoryLabel(a).localeCompare(categoryLabel(b),"pl")).forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = categoryLabel(value);
        $("categoryFilter").append(option);
      });
      render();
    } catch (error) {
      console.error(error);
      $("achievementCount").textContent = "BŁĄD";
      $("achievementGrid").innerHTML = '<div class="achievement-gallery-empty">Nie udało się wczytać katalogu. Sprawdź res/achievements.json.</div>';
    }
  }
  $("achievementSearch").addEventListener("input", render);
  $("categoryFilter").addEventListener("change", render);
  init();
})();
