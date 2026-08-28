export const categories = [
  { id: 'all', label: 'Wszystko' },
  { id: 'irgaelia', label: 'Irgaela' },
  { id: 'divinities', label: 'Bóstwa' },
  { id: 'sidhe', label: 'Sidhe i Inny Świat' },
  { id: 'fomorian', label: 'Fomorianie' },
  { id: 'wyrms', label: 'Wielkie Wyrmy' },
  { id: 'magical-beings', label: 'Istoty magiczne' },
  { id: 'magic-items', label: 'MAGICZNE PRZEDMIOTY' },
  { id: 'magic-materials', label: 'MAGICZNE MATERIAŁY' }
];

export const entries = [
  {
    id: 'irgaela',
    title: 'Irgaela',
    category: 'irgaelia',
    eyebrow: 'ŚWIAT · KRAINA ŚMIERTELNIKÓW',
    summary: 'Kraina śmiertelników, do której przybyli bogowie z odległych Ziem Zachodu.',
    body: `Irgaela była początkowo zamieszkana wyłącznie przez śmiertelników i rządzona przez cztery pierwotne Wyrmy. Po wojnie bogów z Fomorianami na Ziemiach Zachodu bogowie zostali zmuszeni do opuszczenia swojej ojczyzny i popłynęli do Irgaeli. Tam stoczyli Wojnę Mocy i Skrzydeł z Wyrmami i zwyciężyli. Od tamtej pory historia Irgaeli splata się z dziedzictwem bogów, Fomorian, Sidhe i dawnych potęg tego świata.`,
    tags: ['kraina', 'śmiertelnicy', 'bogowie', 'Wyrmy']
  },
  {
    id: 'people-and-tribes',
    title: 'Ludzie i Plemiona',
    category: 'irgaelia',
    eyebrow: 'IRGAELA · LUDY',
    summary: 'Plemiona Tuath tworzą rozproszoną wspólnotę Irgaeli, której tradycje sięgają czasów sprzed przybycia bogów.',
    body: `Plemiona Irgaeli, czyli Tuath, stanowią podstawę śmiertelnego społeczeństwa tej krainy. Ich wspólnoty zachowały własne tradycje, ziemie, przywódców i więzi z miejscami świętymi. Comairle pełni rolę neutralnego miejsca spotkań plemion i tradycyjnej siedziby Najwyższego Króla.`,
    tags: ['Tuath', 'plemiona', 'Irgaela']
  },
  {
    id: 'places-and-regions',
    title: 'Miejsca i Regiony',
    category: 'irgaelia',
    eyebrow: 'IRGAELA · GEOGRAFIA',
    summary: 'Najważniejsze krainy, osady i miejsca, które tworzą mapę Irgaeli.',
    body: `Do najważniejszych miejsc Irgaeli należą Comairle, Cúilfeorna, Trá Fuara, Ravenpass i Raven’s Perch. Każde z nich ma własne znaczenie dla plemion, handlu, obrony lub historii krainy.`,
    tags: ['Comairle', 'Cúilfeorna', 'Ravenpass']
  },
  {
    id: 'places-of-power',
    title: 'Miejsca Mocy i Święte Miejsca',
    category: 'irgaelia',
    eyebrow: 'IRGAELA · SACRUM',
    summary: 'Święte drzewa, świątynie i miejsca, w których świat śmiertelników styka się z boską potęgą.',
    body: `Wśród świętych miejsc Irgaeli szczególne znaczenie mają Cztery Święte Drzewa, w tym Wielki Cis Mądrości w Comairle i Starożytny Dąb w Cúilfeorna. W krainie znajdują się także świątynie i kaplice poświęcone różnym bóstwom oraz miejsca związane z dawnymi wydarzeniami.`,
    tags: ['święte miejsca', 'drzewa', 'Comairle']
  },
  {
    id: 'history-of-world',
    title: 'Historia Świata',
    category: 'irgaelia',
    eyebrow: 'HISTORIA · POCZĄTKI',
    summary: 'Krótka historia świata: Ziemie Zachodu, wojna bogów i Fomorian oraz Wojna Mocy i Skrzydeł.',
    body: `Daleko na zachodzie leżą Ziemie Zachodu, ojczyzna bogów i Fomorian. Bogowie i Fomorianie prowadzili tam wojnę, aż bogowie zostali zmuszeni do wyprawy morskiej do Irgaeli. W Irgaeli śmiertelnicy żyli pod panowaniem czterech pierwotnych Wyrmów. Bogowie wypowiedzieli im wojnę i zwyciężyli. Wojna ta przeszła do historii jako Wojna Mocy i Skrzydeł, a jej skutki nadal kształtują świat.`,
    tags: ['Ziemie Zachodu', 'Wyrmy', 'wojna']
  },
  {
    id: 'culture-traditions',
    title: 'Kultura i Tradycje',
    category: 'irgaelia',
    eyebrow: 'IRGAELA · ZWYCZAJE',
    summary: 'Obyczaje, święta i wierzenia, które nadają rytm życiu mieszkańców Irgaeli.',
    body: `Kultura Irgaeli jest związana z porami roku, pamięcią przodków, druidycznymi tradycjami i cienką granicą pomiędzy światem śmiertelników a Innym Światem. Samhain rozpoczyna rok kampanii i jest czasem, gdy zasłona między światami staje się szczególnie cienka.`,
    tags: ['Samhain', 'druidzi', 'tradycje']
  },
  {
    id: 'history-of-gods',
    title: 'Historia Bogów',
    category: 'divinities',
    eyebrow: 'BÓSTWA · HISTORIA',
    summary: 'Bogowie przybyli do Irgaeli po wojnie z Fomorianami na odległych Ziemiach Zachodu.',
    body: `Boska historia Irgaeli zaczyna się poza nią. Na Ziemiach Zachodu bogowie i Fomorianie toczyli wojnę. Gdy bogowie zostali zmuszeni do opuszczenia swojej ojczyzny, przepłynęli morze i dotarli do Irgaeli. Tam zmierzyli się z czterema pierwotnymi Wyrmami, które władały krainą, i pokonali je. Dziedzictwo tej wojny stanowi fundament współczesnego porządku świata.`,
    tags: ['bogowie', 'Ziemie Zachodu', 'Wyrmy']
  },
  {
    id: 'dagda',
    title: 'Dagda',
    category: 'divinities',
    eyebrow: 'BÓSTWO · MĄDROŚĆ I ŻYCIE',
    summary: 'Bóg mądrości, płodności, wspólnoty i ochrony śmiertelnego życia.',
    body: `Dagda jest potężną postacią ojcowską, stojącą na straży rodzin, wspólnot i świata naturalnego. W walce z Wyrmami wraz z Danu pokonał Féileacánacha, ciskając na niego górę, która stała się Kościaną Górą. Jego kapłani, Starsi Kotła, pełnią role sędziów, nauczycieli i przywódców wspólnot.`,
    tags: ['mądrość', 'życie', 'Kościana Góra']
  },
  {
    id: 'danu',
    title: 'Danu',
    category: 'divinities',
    eyebrow: 'BÓSTWO · BOSKA MATKA',
    summary: 'Boska Matka, związana z ziemią, życiem, stworzeniem i opieką nad światem.',
    body: `Danu jest jedną z najważniejszych boskich postaci Irgaeli. Wraz z Dagdą uczestniczyła w pokonaniu Féileacánacha. Jej obecność łączy boską historię z ziemią, życiem i ciągłością stworzenia.`,
    tags: ['Matka', 'życie', 'stworzenie']
  },
  {
    id: 'brigid',
    title: 'Brigid',
    category: 'divinities',
    eyebrow: 'BÓSTWO · OGNISKO INSPIRACJI',
    summary: 'Bogini ognia, twórczości, rzemiosła i uzdrawiania.',
    body: `Brigid jest boginią ognia, kreatywności i uzdrawiania. Jest patronką rzemieślników, poetów i uzdrowicieli. Jej wyznawcy, zwani Nosicielami Płomienia, dbają o święte ognie i warsztaty.`,
    tags: ['ogień', 'sztuka', 'leczenie']
  },
  {
    id: 'lugh',
    title: 'Lugh',
    category: 'divinities',
    eyebrow: 'BÓSTWO · ŚWIATŁO I MISTRZOSTWO',
    summary: 'Bóg słońca, sztuki, wojny i rzemiosła.',
    body: `Lugh, Długoręki, ucieleśnia mistrzostwo, precyzję, sztukę i siłę. Jest bogiem słońca, wojny i rzemiosła, a jego wyznawcy dążą do doskonałości poprzez dyscyplinę i praktykę.`,
    tags: ['słońce', 'wojna', 'rzemiosło']
  },
  {
    id: 'cernunnos',
    title: 'Cernunnos',
    category: 'divinities',
    eyebrow: 'BÓSTWO · DZIKOŚĆ',
    summary: 'Bóg nieokiełznanej natury, zwierząt, wolności i przemiany.',
    body: `Cernunnos, Dziki, reprezentuje pierwotne siły natury, zwierzęta, instynkt i zmianę. Jego obecność przypomina śmiertelnikom, że świat przyrody ma własny rytm i własne prawa.`,
    tags: ['natura', 'zwierzęta', 'przemiana']
  },
  {
    id: 'morrigan',
    title: 'Morrigan',
    category: 'divinities',
    eyebrow: 'BÓSTWO · LOS I WOJNA',
    summary: 'Widmowa Królowa, związana z losem, wojną, przepowiednią i śmiercią.',
    body: `Morrigan działa poprzez los, konflikty i przepowiednie. Jej plany splatają wydarzenia wielu pór roku, a jej wpływ rozciąga się również na Dziki Gon i jego herolda, Dullahana.`,
    tags: ['los', 'wojna', 'przepowiednia']
  },
  {
    id: 'manannan',
    title: 'Manannán',
    category: 'divinities',
    eyebrow: 'BÓSTWO · MORZE',
    summary: 'Bóg morza i jedna z potęg, które zmierzyły się z pradawnymi Wyrmami.',
    body: `Manannán jest związany z morzem i siłami zachodnich wód. Wraz z Cailleach i przy wsparciu innych bogów uwięził Caoránacha łańcuchami z żywej wody, a następnie strącił go do Krain Zawsze Zimy za zamarzniętym morzem.`,
    tags: ['morze', 'Caoránach', 'żywa woda']
  },
  {
    id: 'cailleach',
    title: 'Cailleach',
    category: 'divinities',
    eyebrow: 'BÓSTWO · ZIMA',
    summary: 'Bogini zimy, lodu i nienaturalnego mrozu.',
    body: `Cailleach włada zimą i jej niebezpiecznym, wynaturzonym obliczem. Wraz z Manannánem pomogła uwięzić Caoránacha, zamykając go w Krainach Zawsze Zimy.`,
    tags: ['zima', 'lód', 'Caoránach']
  },
  {
    id: 'otherworld',
    title: 'Inny Świat',
    category: 'sidhe',
    eyebrow: 'SIDHE · INNY ŚWIAT',
    summary: 'Rzeczywistość poza światem śmiertelników, gdzie czas, odległość i pory roku nie zawsze działają tak samo.',
    body: `Inny Świat jest miejscem, w którym prawa znane śmiertelnikom przestają być oczywiste. Czas i odległość mogą zachowywać się inaczej, a przysięgi, język, przysługi i pakty mają znaczenie większe, niż sugerowałaby ich forma.`,
    tags: ['Inny Świat', 'czas', 'pakty']
  },
  {
    id: 'sidhe',
    title: 'Sidhe',
    category: 'sidhe',
    eyebrow: 'INNY ŚWIAT · ISTOTY',
    summary: 'Tajemniczy lud Innego Świata, związany z dawnymi obyczajami i niebezpiecznymi paktami.',
    body: `Sidhe nie są po prostu ludźmi o nadnaturalnych mocach. Ich obyczaje, wartości i sposoby zawierania umów wynikają z logiki Innego Świata. To, co dla śmiertelnika jest metaforą, dla Sidhe może być wiążącym prawem.`,
    tags: ['Sidhe', 'fae', 'pakty']
  },
  {
    id: 'seelie-unseelie',
    title: 'Seelie i Unseelie',
    category: 'sidhe',
    eyebrow: 'SIDHE · DWIE DWORSKIE TRADYCJE',
    summary: 'Dwie wielkie strony dworskiego porządku Sidhe.',
    body: `Seelie i Unseelie reprezentują dwa odmienne nurty kultury Sidhe. Ich relacje nie powinny być upraszczane do prostego podziału na dobro i zło: obie strony kierują się własnymi prawami, przysługami, lojalnościami i niebezpiecznymi zwyczajami.`,
    tags: ['Seelie', 'Unseelie', 'Sidhe']
  },
  {
    id: 'court-winter',
    title: 'Dwór Zimy',
    category: 'sidhe',
    eyebrow: 'SIDHE · DWÓR',
    summary: 'Dwór związany z zimą i jej miejscem w porządku Innego Świata.',
    body: `Dwór Zimy jest częścią sezonowego porządku Sidhe. Jego miejsce w cyklu pór roku wiąże się z siłami zimna, odosobnienia i przemijania.`,
    tags: ['Dwór', 'Zima', 'Sidhe']
  },
  {
    id: 'court-spring',
    title: 'Dwór Wiosny',
    category: 'sidhe',
    eyebrow: 'SIDHE · DWÓR',
    summary: 'Dwór związany z odrodzeniem, wzrostem i początkiem nowego cyklu.',
    body: `Dwór Wiosny zajmuje miejsce w sezonowym porządku Innego Świata związane z odrodzeniem i początkiem nowego cyklu.`,
    tags: ['Dwór', 'Wiosna', 'Sidhe']
  },
  {
    id: 'court-summer',
    title: 'Dwór Lata',
    category: 'sidhe',
    eyebrow: 'SIDHE · DWÓR',
    summary: 'Dwór związany z latem i mocą Królowej Lata.',
    body: `Dwór Lata pozostaje związany z Królową Lata i równowagą sezonów. Uwięzienie Królowej Lata przez Króla Jesieni narusza ten porządek i ma konsekwencje dla świata śmiertelników.`,
    tags: ['Dwór', 'Lato', 'Królowa Lata']
  },
  {
    id: 'court-autumn',
    title: 'Dwór Jesieni',
    category: 'sidhe',
    eyebrow: 'SIDHE · DWÓR',
    summary: 'Dwór związany z jesienią i Królem Jesieni.',
    body: `Dwór Jesieni jest związany z Królem Jesieni, którego działania przeciwko Królowej Lata stanowią jedno z głównych zaburzeń sezonowej równowagi Innego Świata.`,
    tags: ['Dwór', 'Jesień', 'Król Jesieni']
  },
  {
    id: 'fomorian-history',
    title: 'Historia Fomorian',
    category: 'fomorian',
    eyebrow: 'FOMORIANIE · HISTORIA',
    summary: 'Starożytny lud z Ziem Zachodu, odwieczny przeciwnik bogów.',
    body: `Fomorianie i bogowie prowadzili wojnę na Ziemiach Zachodu. Po przybyciu bogów do Irgaeli konflikt nie zakończył się na zawsze. Fomorianie powrócili jako zagrożenie dla krainy, a ich inwazja stała się jednym z głównych kryzysów jej historii.`,
    tags: ['Fomorianie', 'Ziemie Zachodu', 'wojna']
  },
  {
    id: 'balor',
    title: 'Balor o Złym Oku',
    category: 'fomorian',
    eyebrow: 'FOMORIANIN · KRÓL',
    summary: 'Król Fomorian o demonicznej, czerwonoookiej twarzy.',
    body: `Balor jest królem Fomorian. W przeciwieństwie do typowego Fomorianina posiada demoniczną, czerwonooką głowę. Nad jego rodem ciąży przepowiednia, według której „krew i oko Balora” stanie się przyczyną jego śmierci.`,
    tags: ['Balor', 'król', 'przepowiednia']
  },
  {
    id: 'osmandias',
    title: 'Osmandias Stormeye',
    category: 'fomorian',
    eyebrow: 'FOMORIANIN · KAPITAN CZARNEJ FLOTY',
    summary: 'Syn Balora, dobrowolny wygnańca i dowódca Czarnej Floty.',
    body: `Osmandias Stormeye jest synem Balora i jedynym żyjącym dzieckiem, o którym wiadomo. Przepowiednia mówi o „krwi i oku Balora”, które doprowadzi do jego śmierci. Osmandias żyje na dobrowolnym wygnaniu i dowodzi Czarną Flotą Fomorian. Jego okrętem jest monstrualna Czarna Arka zbudowana z oderwanego klifu, z dokami ukrytymi w jego jaskiniach. Nad Arką stale wisi burza z magicznym okiem, które steruje wiatrami. Co znamienne, Osmandias jako jedyny poza Balorem nie posiada zwierzęcej głowy — jego twarz jest w pełni ludzka.`,
    tags: ['Osmandias', 'Czarna Arka', 'Czarna Flota']
  },
  {
    id: 'ceithleen',
    title: 'Ceithleen o Krzywych Zębach',
    category: 'fomorian',
    eyebrow: 'FOMORIAŃSKIE BÓSTWO',
    summary: 'Zła i pokręcona bogini Fomorian, władająca losem, zmianą, przemocą i ironią.',
    body: `Ceithleen o Krzywych Zębach jest mroczną boginią Fomorian. Jej domeny obejmują zmianę losu, niepokojące sny, przemianę, przemoc, ironię i śmiech. Jej wpływ wiąże się z wypaczaniem tego, co powinno być pewne.`,
    tags: ['Ceithleen', 'los', 'sny', 'przemoc']
  },
  {
    id: 'primordial-wyrms',
    title: 'Pierwotne Wyrmy Irgaeli',
    category: 'wyrms',
    eyebrow: 'WIELKIE WYRMY · HISTORIA',
    summary: 'Cztery pradawne Wyrmy, które władały Irgaelą przed zwycięstwem bogów.',
    body: `Przed przybyciem bogów Irgaela należała do śmiertelników żyjących pod panowaniem czterech pierwotnych Wyrmów. Bogowie stoczyli z nimi Wojnę Mocy i Skrzydeł. Caoránach, Cruimheach i Féileacánach zostali pokonani lub schwytani; Cnagach zdołał uciec i od tamtej pory ukrywa się przed światem.`,
    tags: ['Wyrmy', 'Wojna Mocy i Skrzydeł']
  },
  {
    id: 'caoranach',
    title: 'Caoránach, Mroźny Wyrm',
    category: 'wyrms',
    eyebrow: 'WIELKI WYRМ · ZIMA',
    summary: 'Pierwotny Wyrm mrozu, uwięziony poza Zamarzniętym Morzem.',
    body: `Caoránach został pokonany i uwięziony przez bogów. Manannán i Cailleach, przy wsparciu innych bogów, spętali go łańcuchami z żywej wody, a następnie strącili do Krain Zawsze Zimy, za Zamarzniętym Morzem na północy.`,
    tags: ['mróz', 'Manannán', 'Cailleach']
  },
  {
    id: 'crimheach',
    title: 'Cruimheach, Magmowy Wyrm',
    category: 'wyrms',
    eyebrow: 'WIELKI WYRМ · MAGMA',
    summary: 'Wyrm magmy, który po decydującej bitwie został schwytany przez Fomorian.',
    body: `Cruimheach stoczył z bogami decydującą bitwę. Wycofał się po walce, lecz został następnie schwytany przez Fomorian. Obecnie jest związany z Tronem Balora i pozostaje pod jego władzą.`,
    tags: ['magma', 'Fomorianie', 'Tron Balora']
  },
  {
    id: 'feileacanach',
    title: 'Féileacánach, Kryształowy Wyrm',
    category: 'wyrms',
    eyebrow: 'WIELKI WYRМ · KRYSZTAŁ',
    summary: 'Pokonany przez Dagdę i Danu pod górą, która stała się domem plemienia Dragonbornów.',
    body: `Féileacánach został pokonany, gdy Dagda i Danu cisnęli na niego górę. Ta góra jest dziś znana jako Kościana Góra. Zamieszkuje ją plemię Dragonbornów, którego członkowie próbują przejść Próbę pozwalającą wprowadzić esencję Wyrma do wybranego spośród ich kryształowych Dragonbornów.`,
    tags: ['kryształ', 'Kościana Góra', 'Dragonborn']
  },
  {
    id: 'cnagach',
    title: 'Cnagach, Błyskawiczny Wyrm',
    category: 'wyrms',
    eyebrow: 'WIELKI WYRМ · BŁYSKAWICE',
    summary: 'Jedyny z czterech Wyrmów, który zdołał uniknąć schwytania.',
    body: `Cnagach uciekł przed ostatecznym losem pozostałych Wyrmów. Od czasu Wojny Mocy i Skrzydeł pozostaje w ukryciu, a jego obecne miejsce pobytu nie jest znane.`,
    tags: ['błyskawice', 'ukrycie', 'Wyrmy']
  },
  {
    id: 'tressym',
    title: 'Tressym',
    category: 'magical-beings',
    eyebrow: 'ISTOTA MAGICZNA · GWIEZDNE POCHODZENIE',
    summary: 'Magiczna istota, która może narodzić się, gdy spadająca gwiazda wpada do wody.',
    body: `Według tradycji istot magicznych spadające gwiazdy mogą dawać początek nowemu życiu. Gdy gwiazda spadnie do zbiornika wodnego, rodzi się Tressym.`,
    tags: ['Tressym', 'gwiazdy', 'woda']
  },
  {
    id: 'phoenixes',
    title: 'Feniksy',
    category: 'magical-beings',
    eyebrow: 'ISTOTA MAGICZNA · GWIEZDNE POCHODZENIE',
    summary: 'Feniksy rodzą się, gdy spadająca gwiazda wpada w płonący ogień.',
    body: `Spadająca gwiazda może stworzyć magiczną istotę. Jeśli zetknie się z płonącym ogniem, z jej upadku rodzi się Feniks — istota związana z ogniem i niebiańskim pochodzeniem.`,
    tags: ['Feniks', 'gwiazdy', 'ogień']
  },
  {
    id: 'hags',
    title: 'Hagi',
    category: 'magical-beings',
    eyebrow: 'ISTOTY MAGICZNE',
    summary: 'Niebezpieczne istoty magiczne, których miejsce w świecie będzie rozwijane w kolejnych wpisach.',
    body: `Hagi należą do istot magicznych znanych w świecie Echtra. Szczegółowe pochodzenie, odmiany i historia tej grupy zostaną rozwinięte wraz z kolejnymi materiałami świata.`,
    tags: ['hagi', 'magia']
  },
  {
    id: 'demons',
    title: 'Demony',
    category: 'magical-beings',
    eyebrow: 'ISTOTY MAGICZNE',
    summary: 'Istoty związane z obcą i niebezpieczną mocą.',
    body: `Demony są częścią katalogu istot magicznych świata Echtra. Szczegółowe informacje o ich odmianach, pochodzeniu i miejscu w kosmologii zostaną dodane wraz z dalszym rozwojem kompendium.`,
    tags: ['demony', 'magia']
  },
  {
    id: 'shadows',
    title: 'Cienie',
    category: 'magical-beings',
    eyebrow: 'ISTOTY MAGICZNE',
    summary: 'Ciemne, nadnaturalne istoty związane z cieniem i nieznanym.',
    body: `Cienie należą do katalogu istot magicznych świata Echtra. Szczegółowe informacje pozostają do rozwinięcia w przyszłych artykułach.`,
    tags: ['Cienie', 'magia']
  },
  {
    id: 'magic-items',
    title: 'Magiczne Przedmioty',
    category: 'magic-items',
    eyebrow: 'MAGICZNE PRZEDMIOTY · ARCHIWUM',
    summary: 'Zbiór legendarnych broni, reliktów i przedmiotów o znaczeniu dla historii świata.',
    body: `Magiczne przedmioty Irgaeli są częścią historii bogów, Wyrmów i dawnych wojen. Poszczególne artefakty otrzymają własne wpisy, aby można było śledzić ich pochodzenie, moc i związane z nimi opowieści.`,
    tags: ['artefakty', 'broń', 'relikty']
  },
  {
    id: 'silver-hand',
    title: 'Srebrna Dłoń Nuady',
    category: 'magic-items',
    eyebrow: 'MAGICZNY PRZEDMIOT · RELIKT',
    summary: 'Legendarny artefakt związany z królem Nuadą i dawną wojną z Fomorianami.',
    body: `Srebrna Dłoń Nuady jest jednym z wielkich artefaktów związanych z historią Irgaeli. Jej odzyskanie ma znaczenie zarówno symboliczne, jak i militarne, a sam artefakt może ponownie znaleźć się w rękach króla Nuady.`,
    tags: ['Nuada', 'Fomorianie', 'artefakt']
  },
  {
    id: 'auric-edge',
    title: 'Auric Edge',
    category: 'magic-items',
    eyebrow: 'MAGICZNY PRZEDMIOT · MIECZ',
    summary: 'Legendarny orichalkowy ostrz, którego fragment można odnaleźć w Kuźni Żaru.',
    body: `Auric Edge jest legendarnym ostrzem, którego pozostałości trafiły do rąk kowala Merricka Flamestrike'a. Brakuje części broni, lecz kowal wierzy, że dzięki orichalkum może przywrócić jej zaklęcia.`,
    tags: ['miecz', 'orichalkum', 'Kuźnia Żaru']
  },
  {
    id: 'claiohm-solais',
    title: 'Claíomh Solais',
    category: 'magic-items',
    eyebrow: 'MAGICZNY PRZEDMIOT · MIECZ ŚWIATŁA',
    summary: 'Miecz Światła i jeden z Czterech Skarbów Tuatha Dé Danann.',
    body: `Claíomh Solais, Miecz Światła, jest jednym z Czterech Skarbów Tuatha Dé Danann. Jego obecność wiąże współczesną historię Irgaeli z dawnymi opowieściami o bogach i ich potędze.`,
    tags: ['Miecz Światła', 'Skarby', 'Tuatha Dé Danann']
  },
  {
    id: 'fragarach',
    title: 'Fragarach, Odwetujący',
    category: 'magic-items',
    eyebrow: 'MAGICZNY PRZEDMIOT · MIECZ',
    summary: 'Legendarny oręż o reputacji zdolnej odpowiadać na wyzwanie przeciwnika.',
    body: `Fragarach, Odwetujący, należy do legendarnych broni świata Echtra. Jego nazwa i historia wiążą go z dawnymi opowieściami o boskich bohaterach i wojnach, w których oręż miał znaczenie większe niż zwykła broń.`,
    tags: ['Fragarach', 'legendarny', 'broń']
  },
  {
    id: 'divine-weapons',
    title: 'Osiem Boskich Broni',
    category: 'magic-items',
    eyebrow: 'MAGICZNE PRZEDMIOTY · BÓSTWA',
    summary: 'Osiem boskich oręży związanych z najważniejszymi bóstwami Irgaeli.',
    body: `Boska historia Irgaeli obejmuje osiem wyjątkowych broni przypisywanych bóstwom. W kompendium każda z nich otrzyma osobny wpis, aby połączyć jej właściciela, domenę, historię i znaczenie. Do tej grupy należą między innymi Kostur Światła Dagdy, Sunblade Lugha, Bow of the Wilds Cernunnosa, Spear of the Raven Morrigan i Frost Reaper Cailleach.`,
    tags: ['boska broń', 'bogowie', 'artefakty']
  },
  {
    id: 'magic-materials',
    title: 'Magiczne Materiały',
    category: 'magic-materials',
    eyebrow: 'MAGICZNE MATERIAŁY · RZEMIOSŁO',
    summary: 'Materiały, których właściwości pozwalają tworzyć broń i przedmioty skuteczne przeciw nadnaturalnym istotom.',
    body: `Magiczne materiały są częścią praktycznej wiedzy rzemieślniczej Irgaeli. Zimne Żelazo jest szkodliwe dla Fey, Orichalkum rani Fiendy, a Starmetal szkodzi Aberrations i Monstrosities. Ich znaczenie wykracza poza zwykłą wartość handlową: materiał może decydować o tym, czy broń jest w stanie zranić konkretną nadnaturalną istotę.`,
    tags: ['materiały', 'rzemiosło', 'magia']
  },
  {
    id: 'cold-iron',
    title: 'Zimne Żelazo',
    category: 'magic-materials',
    eyebrow: 'MAGICZNY MATERIAŁ · FEY',
    summary: 'Żelazo o właściwościach szczególnie szkodliwych dla istot Fey.',
    body: `Zimne Żelazo jest materiałem, którego dotyk i ostrze ranią Fey. Jest szczególnie cenione przy tworzeniu uzbrojenia przeznaczonego do walki z istotami związanymi z Innym Światem.`,
    tags: ['Zimne Żelazo', 'Fey', 'broń']
  },
  {
    id: 'orichalcum',
    title: 'Orichalkum',
    category: 'magic-materials',
    eyebrow: 'MAGICZNY MATERIAŁ · FIENDY',
    summary: 'Złoty metal z czerwonym odcieniem, który rani Fiendy.',
    body: `Orichalkum jest złotym metalem o czerwonym odcieniu. Jego magiczna natura sprawia, że rani Fiendy, dzięki czemu ma szczególne znaczenie dla rzemieślników tworzących broń przeciwko tym istotom.`,
    tags: ['Orichalkum', 'Fiendy', 'złoto']
  },
  {
    id: 'starmetal',
    title: 'Starmetal',
    category: 'magic-materials',
    eyebrow: 'MAGICZNY MATERIAŁ · GWIEZDNE POCHODZENIE',
    summary: 'Metal pozostały po uderzeniu spadającej gwiazdy w ziemię; rani Aberracje i Monstrosities.',
    body: `Gdy spadająca gwiazda uderza w ziemię, pozostają po niej kawałki Starmetalu. Materiał ten jest skuteczny przeciw Aberrations i Monstrosities. Jego pochodzenie łączy metal z tym samym kosmicznym zjawiskiem, które może dać początek Tressymom i Feniksom.`,
    tags: ['Starmetal', 'gwiazdy', 'Aberrations', 'Monstrosities']
  }
];
