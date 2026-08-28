import { loadJson, requireArray } from './core/data.js';
import { createElement, clear } from './core/dom.js';

const tbody = document.querySelector('#blog-posts');
const status = document.querySelector('#blog-status');

if (tbody) loadPosts().catch(handleError);

async function loadPosts() {
  const posts = requireArray(await loadJson('./posts.json'), 'posts.json');
  clear(tbody);

  if (!posts.length) {
    tbody.append(createEmptyRow('Brak wpisów w archiwum.'));
    updateStatus(0);
    return;
  }

  posts.forEach(post => tbody.append(createPostRow(post)));
  updateStatus(posts.length);
}

function createPostRow(post) {
  const titleLink = createElement('a', {
    className: 'blog-table__title',
    href: safePath(post.url),
    text: post.title
  });
  const excerpt = createElement('span', {
    className: 'blog-table__excerpt',
    text: post.description || ''
  });

  return createElement('tr', {
    children: [
      createCell(post.date || '—', 'Data'),
      createElement('td', { children: [titleLink, excerpt] }),
      createCell(post.category || '—', 'Kategoria'),
      createCell(post.system || '—', 'System'),
      createElement('td', {
        children: [createElement('a', {
          className: 'blog-table__arrow',
          href: safePath(post.url),
          ariaLabel: 'Otwórz wpis',
          text: '→'
        })]
      })
    ]
  });
}

function createCell(text, label) {
  return createElement('td', {
    text,
    attributes: { 'data-label': label }
  });
}

function createEmptyRow(message) {
  return createElement('tr', {
    children: [createElement('td', {
      text: message,
      attributes: { colspan: '5' }
    })]
  });
}

function updateStatus(count) {
  if (!status) return;
  status.textContent = `ARCHIWUM · ${count} ${count === 1 ? 'WPIS' : 'WPISÓW'}`;
}

function safePath(value) {
  const normalized = String(value ?? '').replace(/^\/+/, '');
  if (normalized.includes('..') || normalized.startsWith('/')) return '#';
  return normalized;
}

function handleError(error) {
  console.error('Blog archive error:', error);
  clear(tbody);
  tbody.append(createEmptyRow('Nie udało się załadować archiwum. Sprawdź, czy posts.json jest dostępny.'));
  if (status) status.textContent = 'ARCHIWUM · BŁĄD ŁADOWANIA';
}
