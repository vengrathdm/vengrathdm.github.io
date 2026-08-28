const gallery = document.querySelector('#illustration-gallery');
const status = document.querySelector('#gallery-status');

const REPOSITORY_API = 'https://api.github.com/repos/vengrathdm/vengrathdm.github.io/contents/illustrations/graphics?ref=main';

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);

if (gallery) loadGallery().catch(handleGalleryError);

async function loadGallery() {
  const files = await getImageFiles(REPOSITORY_API);
  gallery.replaceChildren();

  if (!files.length) {
    showMessage('Brak plików graficznych w katalogu.');
    return;
  }

  files
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
    .forEach(file => gallery.append(createGalleryItem(file)));

  showMessage(`GALERIA · ${files.length} ${files.length === 1 ? 'PLIK' : 'PLIKÓW'}`);
}

async function getImageFiles(url) {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Graphics directory: HTTP ${response.status}`);
  }

  const entries = await response.json();
  const files = [];

  for (const entry of entries) {
    if (entry.type === 'file' && isImageFile(entry.name)) {
      files.push(entry);
      continue;
    }

    if (entry.type === 'dir') {
      files.push(...await getImageFiles(entry.url));
    }
  }

  return files;
}

function isImageFile(filename) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return false;

  return IMAGE_EXTENSIONS.has(filename.slice(dotIndex).toLowerCase());
}

function createGalleryItem(file) {
  const figure = document.createElement('figure');
  figure.className = 'gallery-item';

  const image = document.createElement('img');
  image.src = file.download_url;
  image.alt = formatTitle(file.name);
  image.loading = 'lazy';
  image.decoding = 'async';

  const caption = document.createElement('figcaption');
  caption.textContent = formatTitle(file.name);

  figure.append(image, caption);
  return figure;
}

function formatTitle(filename) {
  const name = filename.replace(/\.[^.]+$/, '');

  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
}

function showMessage(message) {
  if (status) status.textContent = message;
}

function handleGalleryError(error) {
  console.error('Illustration gallery error:', error);
  gallery.replaceChildren();

  const message = document.createElement('div');
  message.className = 'blog-status';
  message.textContent = 'Nie udało się odczytać katalogu ilustracji.';
  gallery.append(message);

  showMessage('GALERIA · BŁĄD ŁADOWANIA');
}
