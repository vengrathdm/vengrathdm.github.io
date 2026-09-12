# DOKUMENT PROJEKTOWY — TERMINAL KAMPANII

## 1. Tożsamość projektu

**Terminal Kampanii** jest lokalnym, statycznym systemem operacyjnym dla prowadzenia kampanii fabularnej D&D osadzonej w uniwersum inspirowanym Gwiezdnymi Wojnami. Ma działać jak komputer istniejący wewnątrz świata gry: konsola dowodzenia, archiwum, wywiad, baza encji, centrum sesji i konsola statku.

Projekt nie jest zwykłą stroną z estetyką science fiction. Zasada nadrzędna brzmi:

> **Immersja służy informacji. Informacja służy grze.**

Interfejs może być mocno stylizowany, ale prowadzący ma błyskawicznie znaleźć postać, BN-a, misję, statek, frakcję albo notatkę.

## 2. Zakres

System docelowo obejmuje: dowodzenie kampanią, sesję na żywo, załogę, postacie, BN-ów, frakcje, korporacje, gangi, misje, galaktykę, układy, planety, lokacje, statki, pojazdy, broń, pancerze, osłony, cybernetykę, komponenty, przedmioty, technologię, kontakty, długi, reputację, zasoby, wydarzenia, oś czasu, lore, transmisje, sekrety, notatki oraz import i eksport.

Pierwsza wersja w `index.html` jest działającym prototypem interfejsu. Pokazuje przepływ nawigacji, warstwę sesji, demonstracyjne encje, wyszukiwanie, dziennik sesji i eksport JSON. Rozbudowa bazy danych powinna następować bez zmiany podstawowej informacji architektury.

## 3. Zasady produktu

### Informacja ponad dekorację

Każdy efekt CRT, poświata, migotanie i element fikcyjnego terminala ma wzmacniać orientację użytkownika. Nie wolno utrudniać odczytu, wyszukiwania ani edycji.

### Jedna baza, wiele widoków

Interfejs jest rendererem danych. Nie należy wpisywać tych samych faktów osobno w widoku postaci, misji, statku i frakcji.

### Encje mają stabilne identyfikatory

Nazwy mogą się zmieniać. ID nie. Przykładowo `npc-0042`, `misja-0021`, `statek-0001`.

### Relacje są pierwszorzędne

Misja wskazuje zleceniodawcę, lokację, planetę, statek, kontakt i przeciwników poprzez ID. Widok rozwiązuje te odwołania do klikalnych rekordów.

### Dane MG i dane graczy są rozdzielone

Informacja powinna posiadać klasyfikację: `PUBLICZNA`, `ZAŁOGA`, `OGRANICZONA`, `TAJNA`, `CZARNA`, `TYLKO MG`. Tryb gracza jest mechanizmem filtrowania danych, nie zabezpieczeniem kryptograficznym.

## 4. Model danych

Podstawowe kategorie:

- **Encja** — trwały obiekt świata.
- **Relacja** — połączenie dwóch lub większej liczby encji.
- **Wydarzenie** — fakt zaistniały w czasie.
- **Notatka** — informacja dopisana przez prowadzącego.
- **Tajemnica** — informacja o ograniczonej widoczności.
- **Dane referencyjne** — wielokrotnie używane definicje sprzętu i technologii.

Każda encja powinna mieć co najmniej: `id`, `name`, `type`, `status`, `tags`, `description`, `createdAt`, `updatedAt`, `relatedEntities`, `gmInfo`, `playerInfo`, `notes`.

W implementacji pola mogą mieć nazwy techniczne, ale wszystkie etykiety, komunikaty i treści wyświetlane użytkownikowi mają być po polsku.

## 5. Hierarchia świata

Docelowy przepływ:

`GALAKTYKA → SEKTOR → UKŁAD → PLANETA → LOKALIZACJA`

W przypadku statku:

`STATEK → SYSTEM → KOMPONENT → USZKODZENIE`

W przypadku historii:

`SESJA → WYDARZENIE → KONSEKWENCJA → RELACJA / MISJA / OŚ CZASU`

## 6. Encje kampanii

### Kampania

Nazwa, podtytuł, kod, aktualny akt, data, lokacja, numer sesji, opis, mistrz gry, tryb gracza, poziom zagrożenia, era, waluta, technologia, reguły podróży, statusy i tagi.

### Postać gracza

Imię, alias, gracz, gatunek, klasa, poziom, doświadczenie, zdrowie, pancerz, osłony, status, lokacja, frakcja, reputacje, kredyty, cybernetyka, broń, pancerz, ekwipunek, pojazdy, kontakty, długi, cele, misje, relacje, historia, biografia publiczna, biografia prywatna, sekrety, notatki i portret.

### BN

Imię, alias, rola, zawód, frakcja, nastawienie, lokacja, status, zagrożenie, gatunek, opis, wygląd, osobowość, motywacje, cele, wiedza, sekrety, relacje, kontakty, wrogowie, długi, zasoby, cybernetyka, broń, pancerz, pojazdy, misje, lokacje, notatki MG i wiedza graczy.

### Frakcja

Nazwa, typ, organizacja nadrzędna, przywództwo, terytorium, siedziba, ideologia, opis, reputacja publiczna, ocena MG, zasoby, siła militarna, siła ekonomiczna, technologia, wpływy polityczne, agenda, cele, sojusznicy, wrogowie, rywale, neutralni, kontrolowane lokacje, systemy, członkowie, ważni BN-i, misje, zasoby, sekrety, historia i relacje.

### Misja

Tytuł, zleceniodawca, klient, pośrednik, lokacja, cel podróży, cele główne i opcjonalne, płatność, koszty, termin, ryzyko, opozycja, wymagane zasoby, sugerowana załoga, konsekwencje frakcyjne, konsekwencje reputacyjne, skutki sukcesu i porażki, ukryty cel, prawdziwa motywacja zleceniodawcy, status, priorytet oraz powiązane encje.

Statusy misji: `SZKIC`, `DOSTĘPNA`, `AKTYWNA`, `WSTRZYMANA`, `UKOŃCZONA`, `NIEUDANA`, `PORZUCONA`, `TAJNA`.

### Statek

Nazwa, rejestr, klasa, producent, właściciel, kapitan, załoga, pozycja, układ, pochodzenie, kadłub, pancerz, osłony, zasilanie, paliwo, ładunek, masa, prędkość, manewrowość, zasięg, sensory, broń, obrona, systemy, komponenty, moduły, ulepszenia, uszkodzenia, konserwacja, koszty, manifest, dług, reputacja, historia, bieżąca misja i notatki.

## 7. Tryby interfejsu

**Świat** służy eksploracji i immersji. Może mocniej korzystać z archiwalnych ekranów, map, transmisji i stylizacji.

**Dowodzenie** służy zarządzaniu kampanią. Powinno odpowiadać na pytanie: „Co dzieje się teraz?”.

**Sesja** służy grze na żywo. Dekoracja jest ograniczona, informacje są większe, a operacje są dostępne bez opuszczania ekranu.

## 8. Estetyka

Rdzeń wizualny to prawie czerń, techniczna typografia, cienkie linie, gęste siatki danych i kontrolowana poświata. Kolory mają znaczenie semantyczne: czerwony — alarm i wrogość; bursztynowy — infrastruktura i ekonomia; cyjan — komunikacja i nawigacja; fioletowy — Moc i anomalie; zielony — stan potwierdzony; jasnoszary — podstawowe dane.

CRT powinien być intensywny na pokładzie dowodzenia i w archiwum, średni w sesji i konsoli statku, a ograniczony w tabelach i formularzach.

## 9. Pamięć lokalna

Docelowa wersja używa IndexedDB jako głównego magazynu stanu kampanii. `localStorage` jest przeznaczony dla lekkich preferencji interfejsu.

Stan należy rozdzielić na stan kampanii, stan interfejsu oraz stan sesji. Aplikacja zapisuje zmiany automatycznie, ale oferuje jawny eksport.

## 10. Import i eksport

Podstawowy format to JSON. Drugim formatem jest Markdown, przeznaczony do archiwizacji i pracy z Gitem. Opcjonalny eksport ZIP może zawierać JSON, Markdown, obrazy, załączniki i metadane.

Import musi najpierw pokazać nowe rekordy, zmienione rekordy, konflikty, błędy, brakujące odwołania i rekordy odrzucone. System nie może bez ostrzeżenia nadpisać kampanii.

## 11. GitHub Pages

Aplikacja musi działać jako statyczna strona. Nie może wymagać serwera, konta, API ani bazy po stronie serwera. Należy stosować ścieżki względne i router zgodny z GitHub Pages.

Hash-routing jest bezpiecznym rozwiązaniem dla podstron: `#/dowodzenie`, `#/postacie`, `#/misje`, `#/statek`, `#/galaktyka`.

## 12. Prywatność

Folder `SecretProjects` ma być ukrytą częścią witryny w sensie nawigacji i odkrywania, ale sama obecność plików w publicznym repozytorium nie jest zabezpieczeniem. Nie należy umieszczać tam prawdziwych tajemnic kampanii, danych osobowych ani prywatnego eksportu MG.

Kod aplikacji może być publiczny. Dane kampanii powinny pozostać lokalne albo w prywatnym repozytorium.

## 13. Kryteria sukcesu

Prowadzący powinien zrozumieć stan kampanii w około 30 sekund, znaleźć znanego BN-a w około 10 sekund, stworzyć podstawowego BN-a w około 30 sekund i utworzyć prostą misję w około minutę.

Aplikacja ma wyglądać jak fikcyjne środowisko komputerowe świata gry, a nie jak Notion, Airtable, arkusz kalkulacyjny, panel SaaS czy generator kart postaci.

## 14. Kierunek rozwoju

Pierwsza faza powinna doprowadzić do pełnego modelu IndexedDB, uniwersalnego renderera encji, relacji, formularzy, importu/eksportu i palety poleceń.

Druga faza powinna dodać mapę galaktyki, widok grafu relacji, generator encji, zegary kampanii, historię zmian i pełny tryb gracza.

Trzecia faza może wprowadzić profile epoki: cyberpunk, przemysłowy, orbitalny, pogranicze, głęboka przestrzeń i opera kosmiczna.

Najważniejsza zasada pozostaje bez zmian: **świat rośnie, a komputer rośnie razem z nim.**
