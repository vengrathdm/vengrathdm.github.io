(() => {
  "use strict";

  const DATA_URL = "../res/characters.json";
  const ACHIEVEMENTS_URL = "../res/achievements.json";
  const $ = id => document.getElementById(id);

  const state = {
    records: [],
    achievements: new Map(),
    filters: {
      player: $("playerFilter"),
      campaign: $("campaignFilter"),
      class: $("classFilter"),
      race: $("raceFilter"),
      status: $("statusFilter")
    }
  };

  const normalize = value => String(value ?? "")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const textOf = record => [
    record.character,
    record.player,
    ...(Array.isArray(record.campaigns) ? record.campaigns : []),
    ...(Array.isArray(record.classes) ? record.classes : []),
    record.race,
    record.status,
    ...(Array.isArray(record.achievements) ? record.achievements : [])
  ].join(" ");

  const asArray = value => Array.isArray(value) ? value : (value ? [value] : []);

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[char]));

  const STATUS_META = {
    "Aktywna": { key: "active", icon: "✦" },
    "Zwycięska": { key: "finished", icon: "♕" },
    "Martwa": { key: "dead", icon: "†" },
    "Wycofana": { key: "retired", icon: "↩" },
    "Porzucona": { key: "abandoned", icon: "∅" }
  };

  const statusMeta = status => STATUS_META[status];
  const displayStatus = status => status;

  const uniqueSorted = values => [...new Set(values.filter(Boolean))]
    .sort((a,b) => String(a).localeCompare(String(b), "pl"));

  function populateFilter(select, values, emptyLabel, formatter = value => value) {
    select.innerHTML = "";
    const first = document.createElement("option");
    first.value = "";
    first.textContent = emptyLabel;
    select.append(first);

    uniqueSorted(values).forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = formatter(value);
      select.append(option);
    });
  }

  function setupFilters() {
    const records = state.records;
    populateFilter(state.filters.player, records.map(r => r.player), "Wszyscy gracze");
    populateFilter(state.filters.campaign, records.flatMap(r => asArray(r.campaigns)), "Wszystkie kampanie");
    populateFilter(state.filters.class, records.flatMap(r => asArray(r.classes)), "Wszystkie klasy");
    populateFilter(state.filters.race, records.map(r => r.race), "Wszystkie rasy");
    populateFilter(state.filters.status, records.map(r => r.status), "Wszystkie statusy", displayStatus);
  }

  function matches(record) {
    const query = normalize($("search").value);
    if (query && !normalize(textOf(record)).includes(query)) return false;

    if (state.filters.player.value && record.player !== state.filters.player.value) return false;
    if (state.filters.campaign.value && !asArray(record.campaigns).includes(state.filters.campaign.value)) return false;
    if (state.filters.class.value && !asArray(record.classes).includes(state.filters.class.value)) return false;
    if (state.filters.race.value && record.race !== state.filters.race.value) return false;
    if (state.filters.status.value && record.status !== state.filters.status.value) return false;

    return true;
  }

  function pills(values) {
    return asArray(values).map(value =>
      '<span class="pill">' + escapeHtml(value) + '</span>'
    ).join("");
  }

  function achievementMarkup(ids) {
    return asArray(ids).map(id => {
      const achievement = state.achievements.get(id);
      if (!achievement) return "";
      return '<div class="achievement" tabindex="0" data-achievement="' + escapeHtml(achievement.id) + '" aria-label="' + escapeHtml(achievement.name) + '">' +
        '<span class="achievement-icon" aria-hidden="true">' + escapeHtml(achievement.icon) + '</span>' +
        '<span class="achievement-tooltip" role="tooltip"><strong>' + escapeHtml(achievement.name) + '</strong><span>' + escapeHtml(achievement.description) + '</span></span>' +
      '</div>';
    }).join("");
  }

  function card(record, index) {
    const status = record.status;
    const meta = statusMeta(status);
    return '<article class="card" tabindex="0" role="button" data-index="' + index + '" data-status="' + meta.key + '" aria-label="Otwórz rekord ' + escapeHtml(record.character) + '">' +
      '<div class="card-achievements" aria-label="Osiągnięcia">' + achievementMarkup(record.achievements) + '</div>' +
      '<div class="portrait"><img src="' + escapeHtml(record.portrait) + '" alt="' + escapeHtml(record.character) + '" loading="lazy" onerror="this.remove()"><span class="status-badge" aria-hidden="true">' + meta.icon + '</span></div>' +
      '<div class="card-body">' +
        '<h3 class="card-name">' + escapeHtml(record.character) + '</h3>' +
        '<div class="meta">' +
          '<div class="meta-row"><span class="meta-label">Gracz</span><span class="meta-value">' + escapeHtml(record.player || "Nie podano") + '</span></div>' +
          '<div class="meta-row"><span class="meta-label">Kampanie</span><span class="pills">' + pills(record.campaigns) + '</span></div>' +
          '<div class="meta-row"><span class="meta-label">Klasy</span><span class="pills">' + pills(record.classes) + '</span></div>' +
          '<div class="meta-row"><span class="meta-label">Rasa</span><span class="meta-value">' + escapeHtml(record.race || "Nie podano") + '</span></div>' +
          '<div class="meta-row"><span class="meta-label">Status</span><span class="status">' + escapeHtml(displayStatus(status)) + '</span></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function updateArchiveStats() {
    const records = state.records;
    const unique = values => new Set(values.filter(Boolean)).size;
    const campaigns = records.flatMap(record => asArray(record.campaigns));
    $("statCharacters").textContent = records.length;
    $("statPlayers").textContent = unique(records.map(record => record.player));
    $("statCampaigns").textContent = unique(campaigns);
    $("statWinning").textContent = records.filter(record => record.status === "Zwycięska").length;
    $("statActive").textContent = records.filter(record => record.status === "Aktywna").length;
    $("statRetired").textContent = records.filter(record => record.status === "Wycofana").length;
    $("statAbandoned").textContent = records.filter(record => record.status === "Porzucona").length;
    $("statDead").textContent = records.filter(record => record.status === "Martwa").length;
  }

  function render() {
    const rows = state.records.filter(matches);
    $("resultCount").textContent = rows.length + " / " + state.records.length;
    $("grid").innerHTML = rows.map((record) => card(record, state.records.indexOf(record))).join("");
    $("empty").hidden = rows.length !== 0;

    $("grid").querySelectorAll(".card").forEach(element => {
      const open = () => openModal(state.records[Number(element.dataset.index)]);
      element.addEventListener("click", open);
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
  }

  function detailItem(label, value, full = false) {
    return '<div class="detail-item' + (full ? " full" : "") + '">' +
      '<span class="detail-label">' + escapeHtml(label) + '</span>' +
      '<div class="detail-value">' + value + '</div>' +
    '</div>';
  }

  function detailPills(values) {
    return '<div class="detail-pills">' + asArray(values).map(value =>
      '<span class="detail-pill">' + escapeHtml(value) + '</span>'
    ).join("") + '</div>';
  }

  function openModal(record) {
    const history = String(record["Historia"] ?? "Brak zapisków.").trim() || "Brak zapisków.";
    $("modalContent").innerHTML =
      '<div class="modal-visual">' +
        '<div class="modal-portrait-wrap" data-status="' + statusMeta(record.status).key + '"><img class="modal-portrait" src="' + escapeHtml(record.portrait) + '" alt="' + escapeHtml(record.character) + '"><span class="status-badge" aria-hidden="true">' + statusMeta(record.status).icon + '</span></div>' +
        '<span class="modal-kicker">PEŁNY REKORD POSTACI</span>' +
        '<h2 id="modalName">' + escapeHtml(record.character) + '</h2>' +
      '</div>' +
      '<div class="modal-data">' +
        '<div class="detail-grid">' +
          detailItem("Postać", escapeHtml(record.character)) +
          detailItem("Gracz", escapeHtml(record.player || "Nie podano")) +
          detailItem("Kampanie", detailPills(record.campaigns), true) +
          detailItem("Klasy", detailPills(record.classes), true) +
          detailItem("Rasa", escapeHtml(record.race || "Nie podano")) +
          detailItem("Status", '<span class="status">' + escapeHtml(displayStatus(record.status)) + '</span>') +
        '</div>' +
        '<section class="history">' +
          '<span class="history-label">HISTORIA</span>' +
          '<h3>Historia postaci</h3>' +
          '<p>' + escapeHtml(history) + '</p>' +
        '</section>' +
      '</div>';

    $("modal").hidden = false;
    $("modal").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    $("modalClose").focus();
  }

  function closeModal() {
    $("modal").hidden = true;
    $("modal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  async function init() {
    try {
      const [response, achievementResponse] = await Promise.all([
        fetch(DATA_URL),
        fetch(ACHIEVEMENTS_URL)
      ]);
      if (!response.ok) throw new Error("HTTP " + response.status + " przy characters.json");
      if (!achievementResponse.ok) throw new Error("HTTP " + achievementResponse.status + " przy achievements.json");
      const [data, achievements] = await Promise.all([response.json(), achievementResponse.json()]);
      if (!Array.isArray(data)) throw new Error("characters.json nie zawiera tablicy rekordów.");
      if (!Array.isArray(achievements)) throw new Error("achievements.json nie zawiera tablicy definicji.");
      state.records = data;
      state.achievements = new Map(achievements.map(achievement => [achievement.id, achievement]));
      setupFilters();
      updateArchiveStats();
      render();
    } catch (error) {
      console.error(error);
      $("resultCount").textContent = "BŁĄD";
      $("grid").innerHTML = '<div class="empty">NIE UDAŁO SIĘ WCZYTAĆ ARCHIWUM / SPRAWDŹ res/characters.json</div>';
    }
  }

  $("search").addEventListener("input", render);

  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== $("search")) {
      event.preventDefault();
      $("search").focus();
    }
  });
  Object.values(state.filters).forEach(select => select.addEventListener("change", render));

  $("clearFilters").addEventListener("click", () => {
    $("search").value = "";
    Object.values(state.filters).forEach(select => { select.value = ""; });
    render();
  });

  $("modalClose").addEventListener("click", closeModal);
  $("modal").addEventListener("click", event => {
    if (event.target.matches("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("modal").hidden) closeModal();
  });

  init();
})();