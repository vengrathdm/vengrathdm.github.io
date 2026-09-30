/* Central character portrait resolver.
 * Explicit data-character-id is authoritative; alt/name matching remains only as a migration fallback.
 */
(async()=>{
 const imgs=[...document.querySelectorAll('img')];
 if(!imgs.length)return;
 try{
  const [c,a]=await Promise.all([
   fetch('/data/characters.json').then(r=>r.json()),
   fetch('/data/assets.json').then(r=>r.json())
  ]);
  const campaignId=document.body.dataset.campaignId||"";
  const assets=new Map(a.assets.map(x=>[x.id,x]));
  const characters=c.characters.filter(x=>!campaignId||x.campaignIds?.includes(campaignId));
  const byId=new Map(characters.map(x=>[x.id,x]));
  const byName=new Map();
  for(const ch of characters){
   const key=(ch.name||"").trim().toLocaleLowerCase('pl-PL');
   if(!key)continue;
   const list=byName.get(key)||[];
   list.push(ch); byName.set(key,list);
  }
  for(const img of imgs){
   let ch=img.dataset.characterId ? byId.get(img.dataset.characterId) : null;
   if(!ch){
    const key=(img.alt||"").trim().toLocaleLowerCase('pl-PL');
    const matches=byName.get(key)||[];
    if(matches.length===1) ch=matches[0];
   }
   if(!ch)continue;
   const asset=assets.get(ch.portraitId);
   if(asset?.path){
    img.src=asset.path;
    img.dataset.characterId=ch.id;
   }
  }
 }catch(e){console.error('Centralny rejestr portretów niedostępny',e)}
})();