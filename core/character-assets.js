/* Transitional portrait resolver: central data, scoped to the current campaign. */
(async()=>{
 const imgs=[...document.querySelectorAll('img[alt]')]; if(!imgs.length)return;
 try{
  const [c,a]=await Promise.all([
   fetch('/data/characters.json').then(r=>r.json()),
   fetch('/data/assets.json').then(r=>r.json())
  ]);
  const campaignId=document.body.dataset.campaignId||"";
  const assets=new Map(a.assets.map(x=>[x.id,x]));
  const chars=c.characters.filter(x=>!campaignId||x.campaignIds?.includes(campaignId));
  const byName=new Map();
  for(const ch of chars){
   const key=(ch.name||"").trim().toLocaleLowerCase('pl-PL');
   if(!key)continue;
   const list=byName.get(key)||[];
   list.push(ch); byName.set(key,list);
  }
  for(const img of imgs){
   if(img.dataset.characterId)continue;
   const key=(img.alt||"").trim().toLocaleLowerCase('pl-PL');
   const matches=byName.get(key)||[];
   if(matches.length!==1)continue;
   const ch=matches[0], asset=assets.get(ch.portraitId);
   if(asset?.path){img.src=asset.path;img.dataset.characterId=ch.id;}
  }
 }catch(e){console.error('Centralny rejestr portretów niedostępny',e)}
})();