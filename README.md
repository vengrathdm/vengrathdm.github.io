# Vengrath

Struktura:

- `index.html` — strona główna GitHub Pages
- `Home/Code/` — kod strony głównej
- `Home/Graphics/` — grafiki
- `Home/Cards/` — źródła kart TXT oraz wygenerowany manifest `index.json`
- `subpages/` — podstrony

Każda karta ma 4 linie: tytuł, tag, ścieżka grafiki, link docelowy.

GitHub Actions generuje `Home/Cards/index.json` z pełnymi danymi kart i odrzuca nieprawidłowe pliki TXT. Strona ładuje manifest jako główne źródło; GitHub Contents API jest używane tylko jako fallback, gdy manifest jest brakujący lub niekompletny.

Układ strony nadal korzysta z Voronoi i losowego rozmieszczenia punktów. Losowość jest wykonywana przy każdym przebudowaniu planszy, więc filtry, wyszukiwanie i resize zachowują obecny dynamiczny charakter.
