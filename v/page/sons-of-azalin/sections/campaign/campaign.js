export function renderCampaignSection(campaign) {
  document.querySelector("#campaign-intro-title").textContent = campaign.introTitle;
  const intro = document.querySelector("#campaign-intro-copy");
  intro.replaceChildren(...campaign.introParagraphs.map(text => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));

  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren(...campaign.dossier.map(([label, value]) => {
    const row = document.createElement("div");
    row.className = "ddc-case-row";
    const key = document.createElement("span");
    key.textContent = label;
    const detail = document.createElement("strong");
    detail.textContent = value;
    if (label === "STATUS") detail.className = "ddc-active";
    row.append(key, detail);
    return row;
  }));

  document.querySelector("#party-title").textContent = campaign.partyTitle;
  document.querySelector("#party-description").textContent = campaign.partyDescription;
  const image = document.querySelector("#party-image");
  image.src = campaign.partyImage;
  image.alt = "Sons of Azalin";
}
