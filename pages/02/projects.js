const grid = document.querySelector('#project-list');
if (grid) {
  fetch('./projects.json')
    .then(response => response.json())
    .then(items => items.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = `index-card${index === 0 ? ' index-card--large' : ''}${index === 4 ? ' index-card--wide' : ''}`;
      article.innerHTML = `<div class="index-art art-project"><span>${String(index + 1).padStart(2,'0')}</span><b>${item.type}</b></div><div class="index-meta"><small>${item.system} · ${item.status}</small><h2>${item.title}</h2></div>`;
      grid.append(article);
    }))
    .catch(error => console.error('Project archive error:', error));
}
