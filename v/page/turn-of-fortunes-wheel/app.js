import {
  loadCampaignBundle,
  applyCampaignTheme,
} from "/v/core/templates/CampaignPage/CampaignPage.js";
import { createSubpageHero } from "/v/core/templates/SubpageHero/SubpageHero.js";
import { mountSubpageNavbar } from "/v/core/templates/SubpageNavbar/SubpageNavbar.js";
import { CharacterGallery } from "/v/core/templates/CharacterGallery/CharacterGallery.js";
import { createChronicleRecord } from "/v/core/templates/Chronicle/ChronicleRecord/ChronicleRecord.js";
import { AudioPlayer } from "/v/core/templates/AudioPlayer/AudioPlayer.js";
import { mountAudioPlayerButton } from "/v/core/templates/AudioPlayerButton/AudioPlayerButton.js";

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
  const kicker = document.createElement("p");
  kicker.textContent = d.campaign.kicker;
  title.before(kicker);
  const lead = document.createElement("p");
  lead.textContent = d.campaign.lead;
  title.after(lead);
  document.querySelector("#campaign-hero").replaceWith(h);
  const nav = document.createElement("div");
  document.body.prepend(nav);
  mountSubpageNavbar(nav, {
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
  document.querySelector("#dossier").replaceChildren(
    ...d.campaign.dossier.map((x) => {
      const row = document.createElement("p");
      row.className = "turn-of-fortunes-wheel-dossier-row";
      row.textContent = x.label + " · " + x.value;
      return row;
    }),
  );
  document.querySelector("#party-title").textContent = d.campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    d.campaign.partyDescription;
  for (const key of ["characters", "chronicle"])
    for (const field of ["kicker", "title", "description"])
      document.querySelector("#" + key + "-" + field).textContent =
        d[key][field];
  await new CharacterGallery(document.querySelector("#character-gallery"), {
    characterIds: d.characters.characterIds,
  }).render();
  document
    .querySelector("#chronicle-records")
    .replaceChildren(
      ...d.chronicle.sessions.map((s) =>
        createChronicleRecord(s, { accent: t.colors.accent2 }),
      ),
    );
  mountAudioPlayerButton(
    new AudioPlayer({ src: m.audio.src, storageKey: m.audio.storageKey }),
    t.colors.accent1,
  );
}
init().catch((e) => {
  console.error(e);
  document.body.prepend(
    document.createTextNode("Nie udało się wczytać kampanii."),
  );
});
