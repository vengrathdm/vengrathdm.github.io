# The Dragon's Due — Mapa relacji

Samodzielna aplikacja mapy relacji kampanii The Dragon's Due, oparta na pełnej funkcjonalności Heartwell Relationship Map i wystylizowana zgodnie z paletą kampanii.

## Pliki

- `index.html` — interfejs mapy.
- `styles.css` — styl w kolorach The Dragon's Due.
- `app.js` — graf Cytoscape, edycja rekordów, filtry, układy, import/eksport i lokalny zapis.
- `data/relationships.json` — oficjalny zestaw danych kampanii.

## Funkcje

Widoki Complete Graph, Political Network, Family Tree, Organization Graph i Character Network; filtrowanie obiektów i relacji; automatyczne i ręczne układy; osobne dossier rekordów; typy obiektów i własne pola; edytor relacji, etykiet, kolorów, stylów linii i kierunków strzałek; import i eksport JSON; lokalny zapis w IndexedDB z kopią localStorage.

Dane robocze są zapisywane w przeglądarce. Aby opublikować je dla wszystkich, wyeksportuj JSON i zaktualizuj `data/relationships.json` w repozytorium.

Mapa jest dostępna również jako sekcja na stronie kampanii The Dragon's Due. Jej lokalny zapis i klucze pamięci są odseparowane od pozostałych map.

## Zależności

Cytoscape.js 3.30.4 jest ładowany z CDN.
