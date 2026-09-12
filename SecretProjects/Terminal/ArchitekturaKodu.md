# ARCHITEKTURA KODU — TERMINAL KAMPANII

Ten dokument jest kontraktem implementacyjnym projektu. Zawiera strukturę katalogów, szablony ekranów, kontrakty danych i przykładowe moduły. Kod może być refaktoryzowany, ale separacja odpowiedzialności powinna pozostać.

## 1. Struktura katalogów

```text
SecretProjects/
└── Terminal/
    ├── index.html
    ├── Dokument Projektowy.md
    └── ArchitekturaKodu.md
```

Docelowo projekt może zostać rozdzielony na CSS, JavaScript i dane:

```text
Terminal/
├── index.html
├── css/
│   ├── reset.css
│   ├── tokens.css
│   ├── base.css
│   ├── layout/
│   │   ├── shell.css
│   │   ├── navigation.css
│   │   └── responsive.css
│   ├── components/
│   │   ├── panels.css
│   │   ├── cards.css
│   │   ├── tables.css
│   │   ├── forms.css
│   │   ├── modals.css
│   │   ├── badges.css
│   │   ├── timeline.css
│   │   └── terminal.css
│   └── themes/
│       ├── crt.css
│       ├── korporacyjny.css
│       ├── uliczny.css
│       ├── orbitalny.css
│       └── kosmiczny.css
├── js/
│   ├── app.js
│   ├── rdzen/
│   │   ├── router.js
│   │   ├── stan.js
│   │   ├── zdarzenia.js
│   │   ├── baza.js
│   │   ├── trwalosc.js
│   │   ├── wyszukiwanie.js
│   │   └── import-eksport.js
│   ├── modele/
│   │   ├── encje.js
│   │   ├── schematy.js
│   │   └── relacje.js
│   ├── interfejs/
│   │   ├── renderer.js
│   │   ├── modal.js
│   │   ├── komunikaty.js
│   │   ├── paleta.js
│   │   ├── formularze.js
│   │   └── tabele.js
│   ├── strony/
│   │   ├── dowodzenie.js
│   │   ├── sesja.js
│   │   ├── zaloga.js
│   │   ├── postacie.js
│   │   ├── frakcje.js
│   │   ├── misje.js
│   │   ├── galaktyka.js
│   │   ├── statek.js
│   │   ├── archiwum.js
│   │   ├── osCzasu.js
│   │   └── ustawienia.js
│   └── narzedzia/
│       ├── generatory.js
│       ├── kosci.js
│       ├── zegary.js
│       └── narzedzia.js
└── dane/
    └── schematy/
```

Prototyp pozostaje świadomie samodzielny w `index.html`, aby można go było uruchomić bez procesu budowania.

## 2. Szablon powłoki

```html
<div class="terminal">
  <header class="naglowek">...</header>
  <div class="uklad">
    <nav class="nawigacja">...</nav>
    <main class="tresc">
      <!-- aktywna strona -->
    </main>
  </div>
  <footer class="stopka">...</footer>
</div>
```

Powłoka nie zawiera danych konkretnej encji. Odpowiada za nawigację, status systemu, temat wizualny i miejsce renderowania.

## 3. Szablon strony

```html
<section class="page" id="identyfikator-strony">
  <h1>Tytuł strony</h1>
  <div class="lede">Krótki opis funkcji strony.</div>
  <div class="controls">
    <!-- wyszukiwanie, filtry, akcje -->
  </div>
  <div class="panel">
    <h2>Nazwa sekcji</h2>
    <!-- zawartość -->
  </div>
</section>
```

Każda strona powinna mieć tytuł, krótkie wyjaśnienie, najważniejsze działania i treść właściwą.

## 4. Szablon karty

```html
<div class="card">
  <h3>ETYKIETA</h3>
  <div class="value">Wartość</div>
  <div class="muted">Dodatkowe dane</div>
</div>
```

Karta jest dobra dla pojedynczego wskaźnika. Nie należy używać kart do długich tekstów ani wielkich tabel.

## 5. Szablon dossier

```html
<div class="panel dossier">
  <header class="dossier-header">
    <div>
      <span class="classification">TAJNE</span>
      <h2>Imię encji</h2>
      <p>Alias · rola · status</p>
    </div>
  </header>
  <div class="rows">
    <div class="row"><span>FRAKCJA</span><span>...</span></div>
    <div class="row"><span>LOKACJA</span><span>...</span></div>
  </div>
</div>
```

Dossier jest podstawowym widokiem szczegółowym postaci, BN-a, statku, frakcji i misji.

## 6. Szablon tabeli

```html
<div class="panel">
  <table>
    <thead>
      <tr><th>NAZWA</th><th>TYP</th><th>STATUS</th><th>LOKACJA</th></tr>
    </thead>
    <tbody id="wyniki"><!-- rekordy --></tbody>
  </table>
</div>
```

Tabele służą do szybkiego skanowania. Szczegółowe dane należy otwierać w dossier.

## 7. Schemat encji

```js
const encja = {
  id: "npc-0042",
  type: "npc",
  name: "Mara Voss",
  status: "aktywna",
  tags: ["kontakt", "pośredniczka"],
  description: "Niezależna pośredniczka z Nar Shaddaa.",
  createdAt: "2026-09-12T18:00:00Z",
  updatedAt: "2026-09-12T18:00:00Z",
  relatedEntities: {
    factions: ["frakcja-0003"],
    locations: ["lokacja-0011"],
    missions: ["misja-0021"]
  },
  gmInfo: "Nie zna całej prawdy o sygnale.",
  playerInfo: "Można z nią negocjować.",
  notes: []
};
```

## 8. Schemat relacji

```js
const relacja = {
  id: "relacja-0091",
  from: "frakcja-0003",
  to: "zaloga-0001",
  type: "reputacja",
  value: -62,
  label: "wrogość",
  createdAt: "2026-09-12T18:00:00Z",
  updatedAt: "2026-09-12T18:00:00Z"
};
```

Nie należy przechowywać nazwy drugiej encji jako jedynego odwołania. Nazwa jest warstwą prezentacji.

## 9. Router

Dla GitHub Pages rekomendowany jest router oparty o hash:

```js
const trasy = {
  "#/dowodzenie": renderujDowodzenie,
  "#/sesja": renderujSesje,
  "#/zaloga": renderujZaloge,
  "#/postacie": renderujPostacie,
  "#/frakcje": renderujFrakcje,
  "#/misje": renderujMisje,
  "#/galaktyka": renderujGalaktyke,
  "#/statek": renderujStatek,
  "#/archiwum": renderujArchiwum,
  "#/ustawienia": renderujUstawienia
};

function uruchomRouter() {
  const sciezka = location.hash || "#/dowodzenie";
  (trasy[sciezka] || renderuj404)();
}
```

Dla encji: `#/npc/npc-0042`, `#/postac/postac-0001`, `#/misja/misja-0021`, `#/frakcja/frakcja-0003`, `#/statek/statek-0001`.

## 10. IndexedDB

Warstwa trwałości:

```js
const konfiguracjaBazy = {
  nazwa: "terminal-kampanii",
  wersja: 1,
  magazyny: [
    "encje", "relacje", "wydarzenia", "notatki",
    "tajemnice", "stanSesji", "ustawienia"
  ]
};
```

Interfejs warstwy bazy:

```js
async function pobierzEncje(typ) {}
async function pobierzEncjePoId(id) {}
async function zapiszEncje(encja) {}
async function usunEncje(id) {}
async function pobierzRelacje(encjaId) {}
async function zapiszRelacje(relacja) {}
```

Strony nie powinny znać szczegółów IndexedDB. Strona pyta warstwę bazy o dane i otrzymuje rekordy.

## 11. Renderer encji

```js
function renderujEncje(encje, kontener) {
  kontener.innerHTML = encje.map(encja => `
    <article class="card" data-encja-id="${esc(encja.id)}">
      <h3>${esc(encja.type)}</h3>
      <div class="value">${esc(encja.name)}</div>
      <div class="muted">${esc(encja.status)}</div>
    </article>
  `).join("");
}
```

Docelowo renderer powinien korzystać ze schematu typu encji, a nie z wielkiego `switch` zawierającego wszystkie pola.

## 12. Schematy typów

```js
const schematy = {
  npc: {
    nazwa: "BN",
    wymagane: ["name", "status"],
    pola: ["alias", "role", "occupation", "faction", "location", "species", "description", "appearance", "personality", "motivations", "goals", "knowledge", "secrets"]
  },
  mission: {
    nazwa: "Misja",
    wymagane: ["name", "status"],
    pola: ["employer", "client", "broker", "location", "destination", "objectives", "payment", "risk", "opposition", "consequences"]
  },
  ship: {
    nazwa: "Statek",
    wymagane: ["name", "status"],
    pola: ["registry", "class", "manufacturer", "owner", "captain", "crew", "currentLocation", "hull", "armor", "shields", "power", "fuel", "cargo", "systems", "weapons", "damage"]
  }
};
```

## 13. Formularz szybkiego tworzenia

Formularz zaczyna od kilku pól, a zaawansowane dane rozwija później:

```html
<form id="nowa-encja">
  <label>Nazwa <input name="name" required></label>
  <label>Typ
    <select name="type">
      <option value="npc">BN</option>
      <option value="mission">Misja</option>
      <option value="item">Przedmiot</option>
      <option value="location">Lokacja</option>
      <option value="contact">Kontakt</option>
    </select>
  </label>
  <label>Status
    <select name="status">
      <option value="aktywna">Aktywna</option>
      <option value="tajna">Tajna</option>
      <option value="archiwalna">Archiwalna</option>
    </select>
  </label>
</form>
```

## 14. Wyszukiwanie

Wyszukiwarka obejmuje `name`, `alias`, `description`, `tags`, `notes`, `locations`, `factions`, `missions`, `characters`, `items`, `lore`, `secrets`. Dokładna nazwa powinna mieć najwyższy ranking, następnie początek nazwy, alias, tag, opis i notatkę.

Filtry: typ, status, frakcja, lokacja, tag, data, klasyfikacja, właściciel, misja, układ i planeta.

## 15. Paleta poleceń

Skrót: `CTRL/CMD + K`.

Polecenia: `NOWY BN`, `NOWA MISJA`, `NOWY PRZEDMIOT`, `NOWA NOTATKA`, `NOWE WYDARZENIE`, `NOWY KONTAKT`, `SZUKAJ KAMPANII`, `OTWÓRZ DOWODZENIE`, `OTWÓRZ STATEK`, `ROZPOCZNIJ SESJĘ`, `EKSPORTUJ KAMPAŃSKI ZESTAW DANYCH`, `IMPORTUJ KAMPAŃSKI ZESTAW DANYCH`, `WŁĄCZ TRYB GRACZA`, `PRZEŁĄCZ CRT`.

## 16. Szablon strony sesji

Sesja musi mieć tytuł, numer, datę, scenę, lokację, cel, spotkanie, inicjatywę, bohaterów, warunki, zegary, cele misji, notatki, sekrety, wydarzenia, dziennik, narzędzia losowe i wyszukiwanie.

Operacje P0: zmiana HP, zmiana stanu misji, dodanie notatki, przesunięcie zegara, dodanie wydarzenia, oznaczenie celu, zmiana uszkodzenia statku i utworzenie BN-a.

## 17. Szablon konsoli statku

```html
<section class="panel statek-status">
  <h2>STATUS STATKU</h2>
  <div class="grid">
    <div class="card">KADŁUB <strong>82%</strong></div>
    <div class="card">PANCERZ <strong>64%</strong></div>
    <div class="card">OSŁONY <strong>71%</strong></div>
    <div class="card">ZASILANIE <strong>88%</strong></div>
    <div class="card">PALIWO <strong>42%</strong></div>
    <div class="card">ŁADUNEK <strong>63%</strong></div>
  </div>
</section>
```

Systemy statku są osobnymi rekordami. Uszkodzenie wskazuje system, a nie tylko liczbę przy statku.

## 18. Szablon misji

```text
MISJA
├── zleceniodawca
├── klient
├── pośrednik
├── lokacja
├── cel podróży
├── cele
├── cele opcjonalne
├── nagroda
├── koszty
├── termin
├── ryzyko
├── opozycja
├── wymagane zasoby
├── sugerowana załoga
├── konsekwencje frakcyjne
├── konsekwencje reputacyjne
├── ukryty cel
├── prawdziwa motywacja
└── powiązane encje
```

## 19. Tryb gracza

Warstwa danych musi filtrować rekord przed rendererem:

```js
function przygotujDlaGracza(encja) {
  return {
    ...encja,
    gmInfo: undefined,
    secrets: undefined,
    privateNotes: undefined
  };
}
```

To jest przykład interfejsu. W finalnej implementacji filtr powinien być centralną polityką widoczności i obejmować także relacje, wyszukiwanie, eksport oraz podglądy.

## 20. Import i eksport

Eksport powinien mieć nagłówek:

```json
{
  "format": "terminal-kampanii",
  "schemaVersion": "1.0",
  "applicationVersion": "0.1.0",
  "exportedAt": "2026-09-12T18:00:00Z",
  "campaignId": "kampania-0001",
  "campaignName": "Czarna Gwiazda",
  "entities": [],
  "relationships": [],
  "events": []
}
```

Walidacja importu musi pokazać rekordy znalezione, nowe, zmienione, konflikty, nieprawidłowe, brakujące odniesienia i odrzucone.

## 21. System komponentów CSS

Podstawowe komponenty to: panel, karta, siatka danych, znacznik, wskaźnik statusu, pasek postępu, miernik, log terminala, nagłówek dossier, odnośnik encji, tag encji, pole wyszukiwania, pasek filtrów, modal, szuflada, paleta poleceń, komunikat, wpis osi czasu, łącznik relacji, zakładki, tabela, pole formularza, dialog potwierdzenia i baner klasyfikacji.

## 22. Motywy

Czerwony alarm służy alarmom, obrażeniom i wrogości. Bursztynowy przemysł służy korporacjom, handlowi i infrastrukturze. Cyjan sieci służy komunikacji i nawigacji. Fiolet nieznanego służy Mocy, anomaliom i artefaktom. Zielony potwierdzony służy stabilności i medycynie. Jasny podstawowy służy najważniejszym danym.

## 23. Animacja

Dozwolone są miganie kursora, statusu, powolne skanowanie, delikatna poświata, odświeżenie danych, mały glitch, linia retrace, aktywacja panelu i krótki efekt przejścia. Zakazane są ciągłe trzęsienie, duży ruch, szybkie miganie i długie ekrany ładowania. Zawsze respektować `prefers-reduced-motion`.

## 24. Responsywność

Desktop jest podstawowym środowiskiem. Tablet musi obsługiwać prowadzenie sesji. Telefon powinien priorytetyzować wyszukiwanie, szybki dostęp, dane postaci, BN-ów, misje, notatki i awaryjne sterowanie sesją. Na telefonie fizyczna ramka CRT znika.

## 25. Klawiatura

Rekomendowane skróty: `CTRL/CMD + K` — paleta, `CTRL/CMD + P` — wyszukiwanie, `N` — nowa encja, `E` — edycja, `S` — zapis, `ESC` — zamknięcie, `G → D` — dowodzenie, `G → S` — sesja, `G → M` — misje, `G → T` — statek.

## 26. Komunikaty systemowe

Zamiast „Zapisano pomyślnie” używać `[DANE ZATWIERDZONE] REKORD NPC-0042 ZAKTUALIZOWANY`. Zamiast „Błąd” używać `[OPERACJA ODRZUCONA] ZAPIS DO BAZY NIEUDANY`. Komunikat ma być immersyjny, ale jednoznaczny.

## 27. Oś czasu

```js
{
  id: "wydarzenie-0042",
  date: "2026-09-12",
  location: "lokacja-0011",
  entities: ["postac-0001", "frakcja-0003"],
  description: "Załoga przejęła dane.",
  consequences: ["relacja-0091"],
  visibility: "załoga"
}
```

Widoki: przeszłość, teraźniejszość, planowana przyszłość oraz wydarzenia bez daty.

## 28. Zegary kampanii

```js
{
  id: "zegar-0007",
  name: "Czystka syndykatu",
  value: 70,
  maximum: 100,
  status: "aktywny",
  relatedEntity: "frakcja-0003"
}
```

Zegar może należeć do kampanii, misji, frakcji lub lokacji.

## 29. Generator

Generatory tworzą prawdziwe rekordy, które można później edytować. Docelowo: BN, frakcja, misja, planeta, układ, lokacja, przedmiot, broń, cybernetyka, statek, kontakt, plotka, kontrakt i przedmiot czarnego rynku.

## 30. Standard implementacyjny

Kod powinien być możliwie prosty, natywny dla przeglądarki i bez zbędnych zależności. Najważniejsze granice:

```text
STRONA → pobiera dane
RENDERER → prezentuje dane
BAZA → przechowuje dane
MODEL → definiuje dane
RELACJE → łączą dane
ROUTER → zmienia widok
STAN → opisuje bieżący interfejs i sesję
```

Żadna strona nie powinna bezpośrednio manipulować strukturą IndexedDB.

## 31. Minimalny punkt wejścia

```js
async function uruchomAplikacje() {
  await baza.inicjalizuj();
  await stan.wczytaj();
  uruchomRouter();
  wyszukiwarka.zbudujIndeks();
}

document.addEventListener("DOMContentLoaded", uruchomAplikacje);
```

## 32. Zasada końcowa

**Kampania jest bazą danych. Baza danych jest światem. Interfejs jest maszyną, przez którą Strażnik Gry nim operuje.**

Każda nowa funkcja powinna być oceniana według tej zasady. Jeśli zwiększa klimat, ale spowalnia prowadzenie gry, wymaga uproszczenia. Jeśli przyspiesza prowadzenie, ale rozbija spójność świata, wymaga integracji z modelem encji i relacji.
