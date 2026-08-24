# Vengrath — publication-ready homepage

To jest kompletna, statyczna strona główna przygotowana pod GitHub Pages.

## Struktura

- `index.html` — jedyna gotowa strona z treścią.
- `assets/css/base.css` — zmienne, typografia, reset i globalne zasady.
- `assets/css/layout.css` — układ strony, header, footer i sekcje.
- `assets/css/components.css` — przyciski, eyebrowy, elementy wspólne i animacje reveal.
- `assets/css/home.css` — styl konkretnej strony głównej.
- `assets/js/atmosphere.js` — subtelny parallax księżyca i latarni.
- `assets/js/reveal.js` — animacje wejścia sekcji przy scrollowaniu.
- `assets/js/navigation.js` — zachowanie nagłówka i powrót na górę.
- `pages/`, `posts/`, `campaigns/`, `sessions/`, `assets/images/` — przygotowane katalogi pod późniejszą rozbudowę.

Linki do podstron są celowo przygotowane, ale ich treść nie została jeszcze zbudowana.

## Typografia

Strona używa fontów Google Fonts z `latin-ext`, dzięki czemu polskie znaki są obsługiwane poprawnie:
- Cinzel — nagłówki i nawigacja.
- Libre Baskerville — tekst redakcyjny.
- Special Elite — elementy stylizowane na maszynopis.
- Manrope — drobna typografia interfejsu.

## GitHub Pages

Wystarczy umieścić zawartość tego katalogu w repozytorium GitHub i włączyć GitHub Pages dla gałęzi/katalogu zawierającego `index.html`.

Adresy linków do Discorda i YouTube są obecnie placeholderami `#`; należy podmienić je na właściwe adresy.


## Gotowe podstrony

- `campaigns/index.html` — katalog kampanii.
- `campaigns/ravenloft.html`, `classic-dnd.html`, `celtic.html`, `greek.html`, `cthulhu.html` — szablony stron kampanii.
- `blog/index.html` — archiwum wpisów.
- `blog/post.html` — szablon pojedynczego wpisu.
- `sessions/index.html` — archiwum nagrań sesji.
- `illustrations/index.html` — galeria ilustracji.
- `about/index.html` — strona „O mnie”.

Każda podstrona korzysta ze wspólnych arkuszy CSS, więc późniejsze zmiany typografii, kolorystyki lub układu nie wymagają edytowania każdej strony osobno.


## Automatyczny blog

Wpisy blogowe znajdują się w `blog/posts/`. Nie trzeba ręcznie edytować `blog/index.html`.

Aby dodać wpis:
1. Skopiuj `blog/posts/example-post.html` i nadaj mu nową nazwę, np. `moja-recenzja.html`.
2. Zmień jego `<title>`, `description` oraz metadane `post-date`, `post-category`, `post-system` i opcjonalnie `post-order`.
3. Wgraj plik do GitHub.
4. GitHub Actions uruchomi `.github/workflows/build-blog.yml`, przeskanuje `blog/posts/*.html` i wygeneruje `blog/posts.json`.
5. Strona `blog/` pobierze ten plik i sama zbuduje tabelę z linkami.

Dzięki temu głównym krokiem przy publikacji jest dodanie nowego pliku HTML. Nie trzeba dopisywać go ręcznie do listy wpisów.

Uwaga: GitHub Pages samo w sobie jest hostingiem statycznym, więc przeglądarka nie może po prostu „wylistować” zawartości folderu serwera. Dlatego mechanizm wykorzystuje GitHub Actions do wygenerowania małego manifestu `posts.json`. Jest to rozwiązanie stabilniejsze niż odpytanie GitHub API z przeglądarki.


## Real-Deal content architecture

Kampanie, Projekty i Blog mają osobne automatyczne katalogi. Kampania lub projekt to folder zawierający `index.html`; wpis blogowy to pojedynczy HTML w `blog/posts/`. GitHub Actions generuje manifesty JSON po każdym pushu.
