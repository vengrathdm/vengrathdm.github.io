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
    if (label === "STATUS") detail.className = "ddc-active";
    row.append(key,detail);
    return row;
  }));

  const notes = document.querySelector("#campaign-notes");
  notes.replaceChildren(...campaign.caseFiles.map((item) => {
    const section = document.createElement("section");
    section.className = "ddc-section";
    const head = document.createElement("div");
    head.className = "ddc-section-head";
    const titleBlock = document.createElement("div");
    const kicker = document.createElement("div");
    kicker.className = "ddc-section-mark";
    kicker.textContent = item.kicker;
    const title = document.createElement("h2");
    title.textContent = item.title;
    const description = document.createElement("p");
    description.textContent = item.description;
    titleBlock.append(kicker,title);
    head.append(titleBlock,description);
    section.append(head);
    return section;
  }));
}
