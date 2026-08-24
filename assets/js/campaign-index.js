(() => {
  const grid = document.querySelector("#campaign-schedule");
  if (!grid) return;

  fetch("./campaigns.json", { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error("Nie udało się pobrać campaigns.json.");
      return response.json();
    })
    .then(campaigns => {
      grid.innerHTML = "";

      if (!campaigns.length) {
        grid.innerHTML = '<div class="blog-status">Brak aktywnych kampanii.</div>';
        return;
      }

      campaigns
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        .forEach(campaign => {
          const card = document.createElement("a");
          card.className = "schedule-card";
          card.href = campaign.url;

          card.innerHTML = `
            <span class="schedule-card__day">${escapeHtml(campaign.day)}</span>
            <span class="status-live">${escapeHtml(campaign.status || "Trwa")}</span>
            <h3 class="schedule-card__title">${escapeHtml(campaign.title)}</h3>
            <span class="schedule-card__system">${escapeHtml(campaign.system)}</span>
            <span class="schedule-card__creator">${escapeHtml(campaign.creator)}</span>
            <span class="schedule-card__arrow">Otwórz kampanię →</span>
          `;

          grid.appendChild(card);
        });
    })
    .catch(error => {
      console.error(error);
      grid.innerHTML = `
        <div class="blog-status">
          Nie udało się załadować grafiku. Sprawdź, czy GitHub Action wygenerował
          <code>campaigns/campaigns.json</code>.
        </div>
      `;
    });

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));
  }
})();
