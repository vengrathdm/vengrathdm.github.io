/* Transitional portrait bridge. Explicit data-character-id is authoritative.
 * Name matching remains only for legacy markup that has not yet been converted.
 */
(async()=>{\n const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});\n if(!globalThis.VengrathData)await loadScript("/core/data.js");\n if(!globalThis.VengrathResolver)await loadScript("/core/resolver.js");
 const imgs=[...document.querySelectorAll("img")]; if(!imgs.length)return;
 try{
  const campaignId=document.body.dataset.campaignId||"";
  const [chars,assets]=await Promise.all([VengrathData.characters(),VengrathData.assets()]);
  const eligible=chars.characters.filter(x=>!campaignId||x.campaignIds?.includes(campaignId));
  const byId=new Map(eligible.map(x=>[x.id,x]));
  const byName=new Map();
  for(const ch of eligible){const k=(ch.name||"").trim().toLocaleLowerCase("pl-PL");if(k){const a=byName.get(k)||[];a.push(ch);byName.set(k,a)}}
  for(const img of imgs){
   let ch=img.dataset.characterId?byId.get(img.dataset.characterId):null;
   if(!ch){const m=byName.get((img.alt||"").trim().toLocaleLowerCase("pl-PL"))||[];if(m.length===1)ch=m[0]}
   if(!ch)continue;
   const asset=await VengrathResolver.asset(ch.portraitId);
   if(asset?.path){img.src=asset.path;img.dataset.characterId=ch.id}
  }
 }catch(e){console.error("Centralny rejestr portretów niedostępny",e)}
})();