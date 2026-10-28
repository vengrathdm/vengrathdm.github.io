export function renderCampaignSection(campaign) {
  const container = document.querySelector("#campaign-section-content");
  const card = document.createElement("section");
  card.className = "ddc-card";

  const cardTitle = document.createElement("div");
  cardTitle.className = "ddc-card-title";
  const number = document.createElement("span");
  number.textContent = "01";
  const label = document.createElement("strong");
  label.textContent = "AKTA KAMPANII";
  cardTitle.append(number, label);

  const cardBody = document.createElement("div");
  cardBody.className = "ddc-card-body";
  const introGrid = document.createElement("div");
  introGrid.className = "ddc-intro-grid";
  const paper = document.createElement("article");
  paper.className = "ddc-paper";

  const introLabel = document.createElement("div");
  introLabel.className = "ddc-section-mark";
  introLabel.textContent = campaign.introLabel;
  const introTitle = document.createElement("h2");
  introTitle.textContent = campaign.introTitle;
  paper.append(introLabel, introTitle);
  campaign.introParagraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    paper.append(paragraph);
  });

  const dossier = document.createElement("aside");
  dossier.className = "ddc-case";
  const dossierTitle = document.createElement("div");
  dossierTitle.className = "ddc-case-label";
  dossierTitle.textContent = campaign.dossierTitle;
  dossier.append(dossierTitle);
  campaign.dossier.forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "ddc-case-row";
    const term = document.createElement("span");
    term.textContent = key;
    const detail = document.createElement("strong");
    detail.textContent = value;
    if (key === "STATUS") detail.className = "ddc-active";
    row.append(term, detail);
    dossier.append(row);
  });
  introGrid.append(paper, dossier);
  cardBody.append(introGrid);
  card.append(cardTitle, cardBody);
  container.replaceChildren(card);

  if (campaign.manifesto) {
    const manifesto = document.createElement("section");
    manifesto.className = "ddc-manifesto";
    const symbol = document.createElement("div");
    symbol.className = "ddc-manifesto-symbol";
    symbol.textContent = "✦";
    const text = document.createElement("div");
    const manifestoLabel = document.createElement("div");
    manifestoLabel.className = "ddc-section-mark";
    manifestoLabel.textContent = campaign.manifesto.label;
    const quote = document.createElement("p");
    quote.textContent = campaign.manifesto.text;
    const attribution = document.createElement("span");
    attribution.textContent = campaign.manifesto.attribution;
    text.append(manifestoLabel, quote, attribution);
    manifesto.append(symbol, text);
    container.append(manifesto);
  }
}
