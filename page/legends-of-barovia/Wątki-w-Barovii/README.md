# Wątki w Barovii

Samodzielna, niezależna aplikacja mapy relacji dla kampanii Legends of Barovia.

- `index.html` — aplikacja i interfejs.
- `styles.css` — styl wizualny Legends of Barovia.
- `app.js` — graf Cytoscape, edycja rekordów, filtry, układy i import/eksport.
- `data/relationships.json` — oficjalny, początkowo pusty zestaw danych.

Aplikacja została skopiowana jako osobna implementacja; nie współdzieli lokalnej bazy ani klucza localStorage z mapą Heartwell. Edycje zapisują się w pamięci przeglądarki. Aby opublikować dane dla wszystkich, wyeksportuj JSON i zaktualizuj plik `data/relationships.json` w repozytorium.

Biblioteka Cytoscape.js 3.30.4 jest ładowana z CDN.
