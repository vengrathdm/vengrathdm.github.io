export function renderCampaignSection(c) {
  document.querySelector("#campaign-intro-title").textContent = c.introTitle;
  const intro = document.querySelector("#campaign-intro-copy");
  intro.replaceChildren(
    ...c.introParagraphs.map((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      return p;
    }),
  );
  const dossier = document.querySelector("#campaign-dossier");
  dossier.replaceChildren(
    ...c.dossier.map(([label, value]) => {
      const row = document.createElement("div");
      row.className = "ddc-case-row";
      const k = document.createElement("span");
      k.textContent = label;
      const v = document.createElement("strong");
      v.textContent = value;
      if (label === "STATUS") v.className = "ddc-active";
      row.append(k, v);
      return row;
    }),
  );
}
