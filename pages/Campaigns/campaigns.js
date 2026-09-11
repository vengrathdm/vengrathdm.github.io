const grid = document.querySelector('#campaign-list');
if (grid) {
  fetch('./campaigns.json')
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(items => items.forEach((item, index) => {
      const slide = document.createElement('a');
      slide.className = 'canvas-slide canvas-slide--campaigns';
      slide.href = item.href || '#';
      slide.draggable = false;
      slide.dataset.slide = index;
      slide.setAttribute('aria-label', `Przejdź do kampanii ${item.title}`);
      slide.innerHTML = `<div class="canvas-art"><span class="canvas-number">${String(index + 1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}</span><span class="canvas-mark canvas-mark--orbit" aria-hidden="true"></span><div class="canvas-copy"><span class="canvas-label">${item.day} · ${item.status}</span><h2>${item.title}</h2><span class="canvas-enter">WEJDŹ ↗</span></div></div>`;
      grid.append(slide);
    }))
    .catch(error => console.error('Campaign archive error:', error));
}
