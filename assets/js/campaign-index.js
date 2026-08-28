import { loadJson, requireArray } from './core/data.js';
import { createElement, clear, showMessage } from './core/dom.js';

const grid = document.querySelector('#campaign-schedule');
if (grid) loadCampaigns().catch(handleError);

async function loadCampaigns() {
  const campaigns = requireArray(await loadJson('./campaigns.json'), 'campaigns.json');
  clear(grid);

  if (!campaigns.length) {
    showMessage(grid, 'Brak aktywnych kampanii.');
    return;
  }

  [...campaigns]
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .forEach(campaign => grid.append(createCampaignCard(campaign)));
}

function createCampaignCard(campaign) {
  return createElement('a', {
    className: 'schedule-card',
    href: campaign.url,
    children: [
      createElement('span', { className: 'schedule-card__day', text: campaign.day }),
      createElement('span', { className: 'status-live', text: campaign.status || 'Trwa' }),
      createElement('h3', { className: 'schedule-card__title', text: campaign.title }),
      createElement('span', { className: 'schedule-card__system', text: campaign.system }),
      createElement('span', { className: 'schedule-card__creator', text: campaign.creator }),
      createElement('span', { className: 'schedule-card__arrow', text: 'Otwórz kampanię →' })
    ]
  });
}

function handleError(error) {
  console.error('Campaign catalog error:', error);
  showMessage(grid, 'Nie udało się załadować grafiku. Sprawdź, czy campaigns.json jest dostępny.');
}
