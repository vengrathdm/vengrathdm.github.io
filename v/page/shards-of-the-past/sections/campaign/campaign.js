export function renderCampaignSection(campaign) {
  document.querySelector("#campaign-intro-title").textContent = campaign.introTitle;
  const introCopy = document.querySelector("#campaign-intro-copy");
  introCopy.replaceChildren(...campaign.introParagraphs.map(text => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));

  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren(...campaign.dossier.map(([label,value]) => {
    const row = document.createElement("div");
    row.className = "ddc-case-row";
    const key = document.createElement("span");
    key.textContent = label;
    const detail = document.createElement("strong");
    detail.textContent = value;
    row.append(key,detail);
    return row;
  }));

  document.querySelector("#campaign-audio-kicker").textContent = campaign.audioKicker;
  document.querySelector("#campaign-audio-title").textContent = campaign.audioTitle;
}
