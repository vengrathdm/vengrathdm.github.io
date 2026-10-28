export function renderCampaignSection(campaign) {
  document.querySelector("#campaign-intro-title").textContent =
    campaign.introTitle;

  const introCopy = document.querySelector("#campaign-intro-copy");
  introCopy.replaceChildren(
    ...campaign.introParagraphs.map((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      return paragraph;
    }),
  );

  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren(
    ...campaign.dossier.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "lob-case-row";

      const key = document.createElement("span");
      key.textContent = label;

      const detail = document.createElement("strong");
      detail.textContent = value;

      if (label === "STATUS") {
        detail.className = "lob-active";
      }

      row.append(key, detail);
      return row;
    }),
  );

  document.querySelector("#party-title").textContent = campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    campaign.partyDescription;
  document.querySelector("#party-image").src = campaign.partyImage;
  document.querySelector("#manifesto-quote").textContent =
    `„${campaign.manifesto}”`;
  document.querySelector("#manifesto-tags").textContent =
    campaign.manifestoTags;
  document.querySelector("#source-title").textContent = campaign.sourceTitle;
  document.querySelector("#source-description").textContent =
    campaign.sourceDescription;
  document.querySelector("#source-link").href = campaign.sourceUrl;
}
