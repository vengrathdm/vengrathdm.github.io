# Architektura strony

Repozytorium jest statyczną stroną hostowaną przez GitHub Pages. Refaktor zachowuje ten model: nie wprowadzamy bundlera ani frameworka, ale oddzielamy dane, wspólne narzędzia i logikę konkretnych widoków.

## Zasady

`assets/js/core/` zawiera kod współdzielony przez wiele widoków. `data.js` odpowiada za pobieranie i podstawową walidację JSON, a `dom.js` za małe, bezpieczne abstrakcje DOM.

Pliki `*-index.js` odpowiadają wyłącznie za jeden widok. Renderowanie poszczególnych elementów jest wydzielone do małych funkcji, dzięki czemu dodanie pola do karty albo nowego typu elementu nie wymaga przebudowy całego skryptu.

Pliki JSON pozostają źródłem danych dla katalogów kampanii, projektów i wpisów. Dodanie nowej pozycji powinno w pierwszej kolejności oznaczać dodanie danych, a nie kopiowanie HTML.

## Gdzie dodawać nowe rzeczy

Nową kampanię dodaj do `campaigns/campaigns.json` i utwórz jej własny katalog. Nowy projekt dodaj do `projects/projects.json` i utwórz katalog projektu. Nowy wpis blogowy dodaj do `blog/posts/` oraz odpowiedni rekord w `blog/posts.json`.

Współdzielone zachowanie dodawaj do `assets/js/core/` tylko wtedy, gdy jest rzeczywiście używane przez więcej niż jeden widok. Logikę specyficzną dla jednej strony pozostaw w jej `*-index.js`.

## HTML i CSS

GitHub Pages serwuje HTML bez etapu preprocessingu, dlatego nie tworzymy pozornych partiali HTML, których przeglądarka nie potrafiłaby sama zaimportować. Wspólne elementy HTML pozostają w dokumentach stron, natomiast powtarzalna zawartość katalogów jest generowana z danych JSON.

CSS pozostaje podzielony według odpowiedzialności: `base.css`, `layout.css`, `components.css`, `home.css` i `subpages.css`. Nowy komponent powinien trafiać do `components.css`, a reguły dotyczące konkretnego widoku do odpowiedniego arkusza widoku.
