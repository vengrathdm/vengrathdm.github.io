export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const { className, text, href, ariaLabel, attributes = {}, children = [] } = options;

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (href) element.href = href;
  if (ariaLabel) element.setAttribute('aria-label', ariaLabel);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  children.forEach(child => element.append(child));
  return element;
}

export function clear(element) {
  element.replaceChildren();
}

export function showMessage(container, message) {
  clear(container);
  container.append(createElement('div', {
    className: 'blog-status',
    text: message
  }));
}
