import { loadJson, requireArray } from './core/data.js';
import { createElement, clear, showMessage } from './core/dom.js';

const schedule = document.querySelector('#home-schedule');
const projects = document.querySelector('#home-projects');
const posts = document.querySelector('#home-posts');

if (schedule && projects && posts) {
  loadHomeContent().catch(error => {
    console.error('Home content error:', error);
    showMessage(schedule, 'Nie udało się załadować grafiku.');
    showMessage(projects, 'Nie udało się załadować projektów.');
    showMessage(posts, 'Nie udało się załadować wpisów.');
  });
}

async function loadHomeContent() {
  const [campaigns, projectItems, blogPosts] = await Promise.all([
    loadJson('campaigns/campaigns.json'),
    loadJson('projects/projects.json'),
    loadJson('blog/posts.json')
  ]);

  renderSchedule(requireArray(campaigns, 'campaigns.json'));
  renderProjects(requireArray(projectItems, 'projects.json'));
  renderPosts(requireArray(blogPosts, 'posts.json'));
}

function renderSchedule(items) {
  clear(schedule);
  items.forEach(item => schedule.append(createScheduleCard(item)));
}

function renderProjects(items) {
  clear(projects);
  items.slice(0, 3).forEach(item => projects.append(createProjectCard(item)));
}

function renderPosts(items) {
  clear(posts);
  if (!items.length) {
    showMessage(posts, 'Brak opublikowanych wpisów.');
    return;
  }

  items.slice(0, 3).forEach(item => posts.append(createPostRow(item)));
}

function createScheduleCard(item) {
  return createElement('a', {
    className: 'schedule-card',
    href: `campaigns/${item.url}`,
    children: [
      createElement('span', { className: 'schedule-card__day', text: item.day }),
      createElement('span', { className: 'status-live', text: item.status }),
      createElement('h3', { className: 'schedule-card__title', text: item.title }),
      createElement('span', { className: 'schedule-card__system', text: item.system }),
      createElement('span', { className: 'schedule-card__creator', text: item.creator })
    ]
  });
}

function createProjectCard(item) {
  return createElement('a', {
    className: 'project-card',
    href: `projects/${item.url}`,
    children: [
      createElement('small', { text: item.type }),
      createElement('h3', { text: item.title }),
      createElement('p', { text: item.description }),
      createElement('span', { className: 'project-card__status', text: item.status })
    ]
  });
}

function createPostRow(item) {
  return createElement('a', {
    className: 'post-row',
    href: `blog/${item.url}`,
    children: [
      createElement('span', { text: '—' }),
      createElement('div', {
        children: [
          createElement('small', { text: `${item.category} · ${item.date}` }),
          createElement('h2', { text: item.title }),
          createElement('p', { text: item.description })
        ]
      }),
      createElement('b', { text: '→' })
    ]
  });
}
