import {
  loadCampaignBundle,
  applyCampaignTheme,
} from "/v/core/templates/CampaignPage/CampaignPage.js";
import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
async function init() {
  const { manifest: m, theme: t, content: d } = await loadCampaignBundle();
  applyCampaignTheme(t);
  const h = createSubpageHero({
    title: d.campaign.title,
    backgroundImage: t.heroImage,
    theme: { accent: t.colors.accent2 },
  });
  h.id = "campaign-hero";
  const title = h.querySelector("h1");
  title.textContent = d.campaign.heroFirstLine;
  const em = document.createElement("em");
  em.textContent = d.campaign.heroSecondLine;
  title.append(document.createElement("br"), em);
  const lead = document.createElement("p");
  lead.textContent = d.campaign.lead;
  title.after(lead);
  document.querySelector("#campaign-hero").replaceWith(h);
  const nav = document.createElement("div");
  h.prepend(nav);
  mountSubpageNavbar(nav, {
    playlistUrl: m.playlistUrl || undefined,
    sections: [
      { text: "Kampania", sectionLink: "campaign", color: t.colors.accent2 },
      { text: "Postaci", sectionLink: "characters", color: t.colors.accent2 },
      { text: "Kronika", sectionLink: "chronicle", color: t.colors.accent2 },
    ],
  });
  document.querySelector("#intro-title").textContent = d.campaign.introTitle;
  document.querySelector("#intro-copy").replaceChildren(
    ...d.campaign.introParagraphs.map((s) => {
      const p = document.createElement("p");
      p.textContent = s;
      return p;
    }),
  );
  document.querySelector("#campaign-dossier").replaceChildren(
    ...d.campaign.dossier.map((x) => {
      const row = document.createElement("div");
      row.className = "campaign-dossier-row";
      const a = document.createElement("span");
      a.textContent = x.label;
      const b = document.createElement("strong");
      b.textContent = x.value;
      row.append(a, b);
      return row;
    }),
  );
  document.querySelector("#party-title").textContent = d.campaign.title;
  document.querySelector("#party-description").textContent = d.campaign.lead;
  document.querySelector("#party-image").src = d.campaign.partyImage;
  document.querySelector("#characters-title").textContent = d.characters.title;
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: d.characters.characterIds,
  }).render();
  document.querySelector("#chronicle-description").textContent =
    d.chronicle.description;
  const p = document.querySelector("#chronicle-playlist");
  if (d.chronicle.playlistUrl) {
    p.href = d.chronicle.playlistUrl;
    p.hidden = false;
  }
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...d.chronicle.sessions.map((s) =>
        createChronicleRecord(s, { accent: t.colors.accent2 }),
      ),
    );
  document.querySelector("#footer-title").textContent =
    "VENGRATH · " + d.campaign.title.toUpperCase();
}
init().catch((e) => {
  console.error(e);
  document.body.prepend(
    document.createTextNode("Nie udało się wczytać kampanii."),
  );
});
