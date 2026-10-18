export function renderCampaignSection(campaign){
 document.querySelector("#campaign-intro-title").textContent=campaign.introTitle;
 const introCopy=document.querySelector("#campaign-intro-copy");
 introCopy.replaceChildren(...campaign.introParagraphs.map(text=>{const p=document.createElement("p");p.textContent=text;return p;}));
 const dossier=document.querySelector("#campaign-dossier");
 dossier.replaceChildren(...campaign.dossier.map(([label,value])=>{const row=document.createElement("div");row.className="ddc-case-row";const key=document.createElement("span");key.textContent=label;const detail=document.createElement("strong");detail.textContent=value;if(label==="STATUS")detail.className="ddc-active";row.append(key,detail);return row;}));
 document.querySelector("#party-title").textContent=campaign.partyTitle;
 document.querySelector("#party-description").textContent=campaign.partyDescription;
 document.querySelector("#party-image").src=campaign.partyImage;
}
