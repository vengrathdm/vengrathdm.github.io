// Zmień nazwy tylko tutaj. Dane statków używają stabilnych identyfikatorów Race1–Race5.
const RACES = Object.freeze({ Race1: "Terran", Race2: "Turian", Race3: "Aasari", Race4: "Quarian", Race5: "Hanar" });
const RACE_PHILOSOPHY = Object.freeze({
  Race1: "Duże, lecz wolniej regenerujące się osłony; jedna główna broń większa od standardu i kilka mniejszych. Mocna faza alpha strike, słabsza wydajność w długim starciu.",
  Race2: "Twardy kadłub, małe osłony i wiele dział o standardowym rozmiarze. Generator pozwala pracować przy około 95–100% nominalnej wydajności.",
  Race3: "Bardzo słaby kadłub, bardzo mocne osłony. Zwykle jeden typ uzbrojenia oraz niewiele, ale bardzo dobrych modułów wsparcia.",
  Race4: "Słaby kadłub, przeciętne osłony i znakomita regeneracja. Bardzo dobre systemy wsparcia, lecz poniżej średniej siła ognia.",
  Race5: "Bardzo mocny kadłub, przeciętne osłony o powolnej regeneracji i wiele małych dział. Wysoka łączna siła ognia, słabe wsparcie."
});
function raceName(id){ return RACES[id] || id; }
