# Książęta Heartwell

Ta wersja strony jest celowo rozdzielona na kilka prostych plików, żeby łatwiej było ją ręcznie rozwijać.

## Struktura

- `index.html` — główna struktura i cała treść kampanii.
- `heartwell.css` — wygląd, układ, typografia, kolory i responsive design.
- `heartwell.js` — interakcje strony: zakładki i elementy rozwijane.
- `HeartwellWiki/` — materiały wiki kampanii.
- `player-characters/` — osobne karty postaci graczy.

## Gdzie co edytować

### Treść kampanii
Edytuj `index.html`.

Sekcje są oznaczone komentarzami:
- OVERVIEW / AKTA MIASTA
- FACTIONS / STRUKTURA
- CASE / DRUŻYNA
- CAMPAIGN NOTES / ZAPISKI Z KAMPANII

Jeżeli dodajesz tekst, NPC, informacje o mieście, sesje albo postać, rób to tutaj.

### Wygląd
Edytuj `heartwell.css`.

Na końcu pliku znajdują się reguły specyficzne dla Heartwell oraz poprawki responsywne. Warto dodawać nowe zmiany w osobnych, opisanych sekcjach zamiast mieszać je z bazowymi stylami.

### Interakcje
Edytuj `heartwell.js`.

Obecnie odpowiada za:
- przełączanie kart bocznego menu,
- otwieranie/zamykanie zapisów sesji.

Nie przenoś tutaj treści strony — dzięki temu `index.html` pozostaje czytelny.

## Obrazy

Główny obraz Heartwell jest używany z:

`../../Home/Graphics/ksiazeta-heartwell.jpg`

Portrety postaci można później podłączać w istniejących blokach `.party-portrait` w `index.html`.

## Zasada

**HTML = co jest na stronie.**  
**CSS = jak wygląda.**  
**JS = jak działa.**

Dzięki temu większość zmian kampanii można wykonywać bez grzebania w pozostałych warstwach.
