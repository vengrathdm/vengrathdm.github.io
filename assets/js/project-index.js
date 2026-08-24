(() => {
  const catalog = document.getElementById("project-catalog");
  const filters = document.getElementById("project-filters");
  if (!catalog) return;

  const root = new URL(".", window.location.href);
  const manifestUrl = new URL("projects.json", root).href;

  fetch(manifestUrl, { cache: "no-store" })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(projects => {
      if (!Array.isArray(projects)) throw new Error("projects.json nie zawiera tablicy.");

      catalog.innerHTML = "";
      if (!projects.length) {
        catalog.innerHTML = '<div class="blog-status">Brak projektów do wyświetlenia.</div>';
        return;
      }

      const render = filter => {
        catalog.innerHTML = "";
        const visible = projects.filter(project => {
          if (filter === "legacy") return project.legacy === true;
          if (filter === "active") return project.legacy !== true;
          return true;
        });

        visible.forEach(project => {
          const card = document.createElement("a");
          card.className = "project-card";
          card.href = project.url;
          card.innerHTML = `
            <span class="project-card__type">${escapeHtml(project.type || "PROJEKT")}</span>
            <h3>${escapeHtml(project.title || "Bez tytułu")}</h3>
            <p>${escapeHtml(project.system || "")}</p>
            <span class="project-card__status">${escapeHtml(project.status || "")}</span>
            <span class="project-card__arrow">Otwórz projekt →</span>
          `;
          catalog.appendChild(card);
        });
      };

      if (filters) {
        filters.querySelectorAll("[data-filter]").forEach(button => {
          button.addEventListener("click", () => {
            filters.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("is-active"));
            button.classList.add("is-active");
            render(button.dataset.filter);
          });
        });
      }

      render("all");
    })
    .catch(error => {
      console.error("Project catalog error:", error);
      catalog.innerHTML = `
        <div class="blog-status">
          Nie udało się załadować katalogu projektów.
          <br><small>Źródło: <code>projects/projects.json</code></small>
        </div>
      `;
    });

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));
  }
})();
