export function renderCampaignSection(campaign) {
  document.querySelector("#campaign-intro-title").textContent =
    campaign.introTitle;
  const introCopy = document.querySelector("#campaign-intro-copy");
  introCopy.replaceChildren();
  campaign.introParagraphs.forEach((paragraph) => {
    const element = document.createElement("p");
    element.innerHTML = paragraph;
    introCopy.append(element);
  });

  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren();
  campaign.dossier.forEach((item) => {
    const row = document.createElement("div");
    row.className = "sands-case-row";
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    if (item.status) value.className = "sands-active-status";
    row.append(label, value);
    dossier.append(row);
  });

  document.querySelector("#party-title").textContent = campaign.partyTitle;
  document.querySelector("#party-description").textContent =
    campaign.partyDescription;
  const partyImage = document.querySelector("#party-image");
  partyImage.src = campaign.partyImage;
  document.querySelector("#manifesto-quote").textContent =
    campaign.manifestoQuote;
  document.querySelector("#manifesto-tags").textContent =
    campaign.manifestoTags;
}
