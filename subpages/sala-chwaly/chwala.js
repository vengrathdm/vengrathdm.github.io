const characters = [
["Pela","Miauriusz","Legends of Barovia","../legends-of-barovia/character-portraits/Pela.png","alive","Los otwarty — bohaterka należy do aktualnej historii Barovii."],
["Luekher","Aureli","Legends of Barovia","../legends-of-barovia/character-portraits/Luekher.png","alive","Los otwarty — dalsze losy zależą od trwającej kampanii."],
["Damira","Kajetan","Legends of Barovia","../legends-of-barovia/character-portraits/Damira.png","alive","Los otwarty — historia nie została jeszcze zamknięta."],
["Pchełka","Zuzanna","Legends of Barovia","../legends-of-barovia/character-portraits/Pchełka.png","alive","Los otwarty — bohaterka nadal jest częścią opowieści."],
["Eliasz","—","Legends of Barovia","../legends-of-barovia/character-portraits/Eliasz.png","dead","Poległ podczas kampanii."],
["Zwada","wpoluwiatr","Mences of Irensberg","../mences-of-irensberg/postaci-graczy/Zwada.webp","alive","Los otwarty — kampania jest aktywna."],
["Oxie","Dawid","Mences of Irensberg","../mences-of-irensberg/postaci-graczy/Oxie.webp","alive","Los otwarty — kampania jest aktywna."],
["Keto","Anemo","Mences of Irensberg","../mences-of-irensberg/postaci-graczy/Keto.webp","alive","Los otwarty — kampania jest aktywna."],
["Thorgir","Szymon","Mences of Irensberg","../mences-of-irensberg/postaci-graczy/Thorgir.webp","alive","Los otwarty — kampania jest aktywna."],
["Belle de Beaumont","wpoluwiatr","Red Blood Snow White","../red-blood-snow-white/portrety-postaci/Belle.png","unknown","Kampania została przerwana po pięciu sesjach; dalszy los postaci nie został określony."],
["Vespera Hexbound","Mat","Red Blood Snow White","../red-blood-snow-white/portrety-postaci/Vespera.png","unknown","Kampania została przerwana po pięciu sesjach; dalszy los postaci nie został określony."],
["Seryth T'sarran","Sandra","Red Blood Snow White","../red-blood-snow-white/portrety-postaci/Seryth.png","unknown","Kampania została przerwana po pięciu sesjach; dalszy los postaci nie został określony."],
["Araina Windmere","Maria","Red Blood Snow White","../red-blood-snow-white/portrety-postaci/Ariana.png","unknown","Kampania została przerwana po pięciu sesjach; dalszy los postaci nie został określony."],
["Vaelor","Rezus","Sands of Doom","../sands-of-doom/portrety-postaci/Vaelor.png","alive","Los otwarty — kampania trwa."],
["Bromli","koksuvi","Sands of Doom","../sands-of-doom/portrety-postaci/Bromli.png","alive","Los otwarty — kampania trwa."],
["Gromar","Lexonis","Sands of Doom","../sands-of-doom/portrety-postaci/Gromar.png","alive","Los otwarty — kampania trwa."],
["Samira","Jeesso","Sands of Doom","../sands-of-doom/portrety-postaci/Samira.png","alive","Los otwarty — kampania trwa."],
["Busto","—","Sands of Doom","../sands-of-doom/portrety-postaci/Busto.png","dead","Poległ na Wielkim Pustkowiu."],
["Nefira","—","Sands of Doom","../sands-of-doom/portrety-postaci/Nefira.png","dead","Poległa na Wielkim Pustkowiu."],
["Miriadae","Wpoluwiatr","Shards of the Past","../shards-of-the-past/postaci-graczy/Miriadae.jpg","finished","Kampania zakończyła się na około 2/3 materiału. Indywidualny finał nie został opisany w archiwum."],
["Zog","Koar","Shards of the Past","../shards-of-the-past/postaci-graczy/Zog.png","finished","Kampania zakończyła się na około 2/3 materiału. Indywidualny finał nie został opisany w archiwum."],
["Styx","Bartek","Shards of the Past","../shards-of-the-past/postaci-graczy/Styx.jpg","finished","Kampania zakończyła się na około 2/3 materiału. Indywidualny finał nie został opisany w archiwum."],
["Kukdu","Michał Wodziczko","Shards of the Past","../shards-of-the-past/postaci-graczy/Kukdu.png","finished","Kampania zakończyła się na około 2/3 materiału. Indywidualny finał nie został opisany w archiwum."],
["Oorim","koksuvi","Turn of Fortune's Wheel","../turn-of-fortunes-wheel/portrety-postaci/Oorim.png","finished","Dotarł do finału ukończonej kampanii. Osobnego epilogu postaci nie podano."],
["Kelan","lexonis","Turn of Fortune's Wheel","../turn-of-fortunes-wheel/portrety-postaci/Kelan.png","finished","Dotarł do finału ukończonej kampanii. Osobnego epilogu postaci nie podano."],
["Roderick","rezus","Turn of Fortune's Wheel","../turn-of-fortunes-wheel/portrety-postaci/Roderick.png","finished","Dotarł do finału ukończonej kampanii. Osobnego epilogu postaci nie podano."],
["Adria","vissara","Turn of Fortune's Wheel","../turn-of-fortunes-wheel/portrety-postaci/Adria.png","finished","Dotarła do finału ukończonej kampanii. Osobnego epilogu postaci nie podano."],
["Varok Nightshade","Viking","Turn of Fortune's Wheel","../turn-of-fortunes-wheel/portrety-postaci/Varok Nightshade.png","finished","Dotarł do finału ukończonej kampanii. Osobnego epilogu postaci nie podano."]
];
const labels={alive:"ŻYJE / LOS OTWARTY",dead:"POLEGŁA / POLEGŁY",finished:"HISTORIA ZAKOŃCZONA",unknown:"LOS NIEUSTALONY"};
const $=id=>document.getElementById(id), norm=s=>s.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const grid=$("hallGrid"), search=$("search"), cf=$("campaignFilter"), ff=$("fateFilter");
[...new Set(characters.map(x=>x[2]))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;cf.append(o)});
$("countAll").textContent=characters.length;$("countDead").textContent=characters.filter(x=>x[4]=="dead").length;$("countCampaigns").textContent=new Set(characters.map(x=>x[2])).size;$("countPlayers").textContent=new Set(characters.map(x=>x[1]).filter(x=>x!=="—")).size;
function render(){const q=norm(search.value.trim()),a=cf.value,b=ff.value;const rows=characters.filter(x=>(!q||norm(x.join(" ")).includes(q))&&(!a||x[2]===a)&&(!b||x[4]===b));$("resultCount").textContent=rows.length+" / "+characters.length;grid.innerHTML=rows.map((x,i)=>'<article class="card" data-fate="'+x[4]+'"><div class="portrait"><img src="'+x[3]+'" alt="'+x[0]+'" loading="lazy" onerror="this.remove()"></div><div class="card-body"><div class="card-no">AKTA '+String(i+1).padStart(2,"0")+'</div><h3>'+x[0]+'</h3><div class="meta"><div><b>Gracz</b><span>'+x[1]+'</span></div><div><b>Kampania</b><span>'+x[2]+'</span></div></div><div class="fate"><strong>'+labels[x[4]]+'</strong><br>'+x[5]+'</div></div></article>').join("");$("empty").hidden=rows.length!==0}
[search,cf,ff].forEach(el=>el.addEventListener("input",render));$("clearFilters").addEventListener("click",()=>{search.value="";cf.value="";ff.value="";render()});render();