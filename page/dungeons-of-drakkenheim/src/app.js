import { el } from './dom.js';
import { initScreenCrystalFrame, attachCrystalFrame, attachChronicleCrystals } from './crystal-framing.js';
import { renderParty } from './character-cards.js';
import { renderChron } from './chronicle.js';
import { renderOverview } from './overview.js';
import { initNavigation } from './navigation.js';
import { initEmbeddedWorkspaces } from './embedded-workspaces.js';
import { initCampaignAudio } from './audio.js';

const DATA = {
  "characters": [],
  "chronicle": [],
  "overview": [
    {
      "kind": "situation",
      "title": "Przysięga Drakkenheim",
      "meta": "Drakkenheim · wygnańcy · przepowiednia",
      "stamp": "Kronika kampanii"
    },
    {
      "kind": "metric",
      "title": "Sesje",
      "value": "",
      "detail": "Sesje zapisane w kronice kampanii"
    },
    {
      "kind": "metric",
      "title": "Bohaterowie",
      "value": "",
      "detail": "Pięcioro bohaterów kampanii Drakkenheim."
    },
    {
      "kind": "metric",
      "title": "Oś opowieści",
      "value": "",
      "detail": "Tajemnice zrujnowanego miasta"
    },
    {
      "kind": "metric",
      "title": "",
      "value": "",
      "detail": "36 zapisanych spotkań"
    },
    {
      "kind": "threats",
      "title": "Wątki kampanii",
      "items": [
        {
          "text": "Źródła delirium",
          "status": "Centralny",
          "level": "active"
        },
        {
          "text": "Frakcje Drakkenheim",
          "status": "Powracający",
          "level": "suspected"
        },
        {
          "text": "Tajemnica Mgły",
          "status": "Rozstrzygnięty",
          "level": "resolved"
        }
      ]
    },
    {
      "kind": "clue",
      "title": "Ostatni wpis kroniki",
      "quote": "„Miasto nie odda swoich sekretów bez walki”.",
      "text": "Wybierz wpis w Kronice, aby otworzyć zapis sesji."
    }
  ]
};

function renderAll(){
  renderParty(DATA, el, attachCrystalFrame);
  renderChron(DATA, el, attachChronicleCrystals);
  renderOverview(DATA, el);
}

initScreenCrystalFrame();
renderAll();
initEmbeddedWorkspaces();
initNavigation();
initCampaignAudio();

fetch('./chronicle.json')
  .then(function(response){
    if(!response.ok) throw new Error('Chronicle unavailable');
    return response.json();
  })
  .then(function(payload){
    DATA.chronicle = payload.sessions || [];
    renderChron(DATA, el, attachChronicleCrystals);
  })
  .catch(function(error){
    console.warn('Nie udało się wczytać kroniki Drakkenheim:', error);
  });

window.CampaignHub = {
  setCharacters: function(characters){
    DATA.characters = (characters || []).slice(0, 5);
    renderParty(DATA, el, attachCrystalFrame);
  },
  setChronicle: function(sessions){
    DATA.chronicle = sessions || [];
    renderChron(DATA, el, attachChronicleCrystals);
  },
  setOverview: function(overview){
    DATA.overview = overview;
    renderOverview(DATA, el);
  },
  mounts: {
    map: document.querySelector('#map-mount'),
    notes: document.querySelector('#notes-mount')
  }
};

fetch('/core/data/characters.json')
  .then(function(response){
    if(!response.ok) throw new Error('Character registry unavailable');
    return response.json();
  })
  .then(function(records){
    var ids = ['char-0045','char-0046','char-0047','char-0048','char-0049'];
    var players = ids.map(function(id){
      return records.find(function(character){ return character.id === id; });
    }).filter(Boolean).map(function(character){
      return {
        name: character.character,
        player: character.player,
        race: character.race,
        class: (character.classes || []).join(' / '),
        bio: character.history,
        portrait: character.portrait,
        status: character.status
      };
    });
    window.CampaignHub.setCharacters(players);
  })
  .catch(function(error){
    console.warn('Nie udało się wczytać postaci drużyny:', error);
  });
