const grid = document.querySelector('#campaign-list');
if (grid) {
  fetch('./campaigns.json')
    .then(response => response.json())
    .then(items => items.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = `index-card${index === 0 ? ' index-card--large' : ''}${index === 4 ? ' index-card--wide' : ''}`;
      article.innerHTML = `<div class="index-art art-campaign"><span>${String(index + 1).padStart(2,'0')}</span><b>${item.day} · ${item.status}</b></div><div class="index-meta"><small>${item.system} · ${item.creator}</small><h2>${item.title}</h2><p>${item.status}.</p></div>`;
      grid.append(article);
    }))
    .catch(error => console.error('Campaign archive error:', error));
}
