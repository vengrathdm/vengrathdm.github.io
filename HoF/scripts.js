(() => {
  "use strict";

  const DATA_URL = "../res/characters.json";
  const ACHIEVEMENTS_URL = "../res/achievements.json";
  const $ = id => document.getElementById(id);

  const state = {
    records: [],
    awards: [],
    awardsByCharacter: new Map(),
    achievements: new Map(),
    filters: {
      player: $("playerFilter"),
      campaign: $("campaignFilter"),
      module: $("moduleFilter"),
      class: $("classFilter"),
      race: $("raceFilter"),
      status: $("statusFilter"),
      achievement: $("achievementFilter")
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
    ...(Array.isArray(record.modules) ? record.modules : []),
    ...(Array.isArray(record.classes) ? record.classes : []),
    record.race,
    record.status,
    record.history,
    ...achievementIdsFor(record).map(id => state.achievements.get(id)?.name || id)
  ].join(" ");

  const asArray = value => Array.isArray(value) ? value : (value ? [value] : []);
  const achievementIdsFor = record => [...new Set((state.awardsByCharacter.get(record.id) || []).map(award => award.achievementId))];

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
    populateFilter(state.filters.module, records.flatMap(r => asArray(r.modules)), "Wszystkie moduły");
    populateFilter(state.filters.class, records.flatMap(r => asArray(r.classes)), "Wszystkie klasy");
    populateFilter(state.filters.race, records.map(r => r.race), "Wszystkie rasy");
    populateFilter(state.filters.status, records.map(r => r.status), "Wszystkie statusy", displayStatus);
    populateFilter(state.filters.achievement, state.achievements.keys().map(id => id), "Wszystkie tytuły", id => state.achievements.get(id)?.name || id);
  }

  function matches(record) {
    const query = normalize($("search").value);
    if (query && !normalize(textOf(record)).includes(query)) return false;

    if (state.filters.player.value && record.player !== state.filters.player.value) return false;
    if (state.filters.campaign.value && !asArray(record.campaigns).includes(state.filters.campaign.value)) return false;
    if (state.filters.module.value && !asArray(record.modules).includes(state.filters.module.value)) return false;
    if (state.filters.class.value && !asArray(record.classes).includes(state.filters.class.value)) return false;
    if (state.filters.race.value && record.race !== state.filters.race.value) return false;
    if (state.filters.status.value && record.status !== state.filters.status.value) return false;
    if (state.filters.achievement.value && !achievementIdsFor(record).includes(state.filters.achievement.value)) return false;

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
      const rarity = achievementRarity(achievement.id);
      return '<div class="achievement rarity-' + rarity + '" tabindex="0" data-achievement="' + escapeHtml(achievement.id) + '" aria-label="' + escapeHtml(achievement.name) + '">' +
        '<span class="achievement-icon" aria-hidden="true">' + escapeHtml(achievement.icon) + '</span>' +
        '<span class="achievement-tooltip" role="tooltip"><strong>' + escapeHtml(achievement.name) + '</strong><span>' + escapeHtml(achievement.description) + '</span><small>' + escapeHtml(categoryLabel(achievement.category)) + ' · ' + escapeHtml(rarityLabel(rarity)) + '</small></span>' +
      '</div>';
    }).join("");
  }

  function card(record, index) {
    const status = record.status;
    const meta = statusMeta(status);
    return '<article class="card" tabindex="0" role="button" data-index="' + index + '" data-status="' + meta.key + '" aria-label="Otwórz rekord ' + escapeHtml(record.character) + '">' +
      '<div class="card-achievements" aria-label="Osiągnięcia">' + achievementMarkup(achievementIdsFor(record)) + '</div>' +
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

  const CATEGORY_LABELS = {
    "przetrwanie":"Przetrwanie", "fabula":"Fabuła", "osiagniecia":"Osiągnięcia",
    "poswiecenie":"Poświęcenie", "walka":"Walka", "przemiana":"Przemiana",
    "magia":"Magia", "pakt":"Pakty", "wplywy":"Wpływy", "majetek":"Majątek",
    "artefakty":"Artefakty", "katastrofa":"Katastrofa", "humor":"Humor",
    "przedmioty":"Przedmioty", "inne":"Inne"
  };
  const categoryLabel = category => CATEGORY_LABELS[category] || "Inne";
  function achievementRarity(id) {
    const count = new Set(state.awards.filter(award => award.achievementId === id).map(award => award.characterId)).size;
    if (count <= 1) return "legendary";
    if (count <= 5) return "rare";
    if (count <= 15) return "uncommon";
    return "common";
  }
  const rarityLabel = rarity => ({
    legendary:"Legendarne", rare:"Rzadkie", uncommon:"Niepospolite", common:"Pospolite"
  })[rarity] || "Nieznana";
  function achievementDetailMarkup(ids) {
    const known = asArray(ids).map(id => state.achievements.get(id)).filter(Boolean);
    if (!known.length) return '<span class="muted-detail">Brak zdobytych osiągnięć</span>';
    return '<div class="modal-achievements">' + known.map(achievement => {
      const rarity = achievementRarity(achievement.id);
      return '<div class="modal-achievement rarity-' + rarity + '">' +
        '<span class="modal-achievement-icon" aria-hidden="true">' + escapeHtml(achievement.icon) + '</span>' +
        '<div><strong>' + escapeHtml(achievement.name) + '</strong>' +
        '<p>' + escapeHtml(achievement.description) + '</p>' +
        '<small>' + escapeHtml(categoryLabel(achievement.category)) + ' · ' + escapeHtml(rarityLabel(rarity)) + '</small></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function updateArchiveStats(records = state.records) {
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
    updateArchiveStats(rows);
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
    const history = String(record.history ?? "Brak zapisków.").trim() || "Brak zapisków.";
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
          detailItem("Osiągnięcia", achievementDetailMarkup(achievementIdsFor(record)), true) +
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

  function validateData(records, achievements, awards) {
    const errors = [];
    const required = ["id", "portrait", "character", "player", "campaigns", "classes", "race", "status", "history", "modules"];
    const achievementIds = new Set(achievements.map(item => item.id));
    const recordIds = new Set();
    const validStatuses = new Set(Object.keys(STATUS_META));
    records.forEach((record, index) => {
      required.forEach(key => { if (!(key in record)) errors.push("Postać #" + (index + 1) + ": brak pola " + key); });
      if (recordIds.has(record.id)) errors.push("Powtórzone ID postaci: " + record.id);
      recordIds.add(record.id);
      if (!Array.isArray(record.campaigns) || !Array.isArray(record.modules) || !Array.isArray(record.classes)) errors.push("Postać " + (record.id || "#" + (index + 1)) + ": campaigns/modules/classes muszą być tablicami");
      if (!validStatuses.has(record.status)) errors.push("Nieznany status: " + record.status);
    });
    const seen = new Set();
    achievements.forEach(item => {
      if (!item.id || !item.name || !item.icon || !item.description || !item.category) errors.push("Niekompletna definicja osiągnięcia: " + (item.id || "(brak ID)"));
      if (seen.has(item.id)) errors.push("Powtórzone ID osiągnięcia: " + item.id);
      seen.add(item.id);
    });
    const awardIds = new Set();
    awards.forEach(award => {
      if (!award.id || !award.characterId || !award.achievementId) errors.push("Niekompletny rekord nagrody: " + (award.id || "(brak ID)"));
      if (awardIds.has(award.id)) errors.push("Powtórzone ID nagrody: " + award.id);
      awardIds.add(award.id);
      if (!recordIds.has(award.characterId)) errors.push("Nieznana postać w nagrodzie " + award.id + ": " + award.characterId);
      if (!achievementIds.has(award.achievementId)) errors.push("Nieznane osiągnięcie w nagrodzie " + award.id + ": " + award.achievementId);
      if (award.awardedAt && !/^\\d{4}-\\d{2}-\\d{2}$/.test(award.awardedAt)) errors.push("Nieprawidłowa data nagrody: " + award.id);
    });
    return errors.slice(0, 12);
  }

  async function init() {
    try {
      const [response, achievementResponse, awardsResponse] = await Promise.all([
        fetch(DATA_URL),
        fetch(ACHIEVEMENTS_URL),
        fetch("../res/achievement-awards.json")
      ]);
      if (!response.ok) throw new Error("HTTP " + response.status + " przy characters.json");
      if (!achievementResponse.ok) throw new Error("HTTP " + achievementResponse.status + " przy achievements.json");
      if (!awardsResponse.ok) throw new Error("HTTP " + awardsResponse.status + " przy achievement-awards.json");
      const [data, achievements, awards] = await Promise.all([response.json(), achievementResponse.json(), awardsResponse.json()]);
      if (!Array.isArray(data)) throw new Error("characters.json nie zawiera tablicy rekordów.");
      if (!Array.isArray(achievements)) throw new Error("achievements.json nie zawiera tablicy definicji.");
      if (!Array.isArray(awards)) throw new Error("achievement-awards.json nie zawiera tablicy nagród.");
      const errors = validateData(data, achievements, awards);
      if (errors.length) throw new Error("Błędy danych: " + errors.join(" | "));
      state.records = data;
      state.awards = awards;
      state.awardsByCharacter = new Map();
      awards.forEach(award => {
        if (!state.awardsByCharacter.has(award.characterId)) state.awardsByCharacter.set(award.characterId, []);
        state.awardsByCharacter.get(award.characterId).push(award);
      });
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