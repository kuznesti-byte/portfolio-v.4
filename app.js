import { buttonRow, caseCard, filterGroup, glassButton, setupDialog } from './components.js';
import { categories, projects, telegramUrl } from './portfolio-data.js';
import { caseStudies, caseUrl } from './case-studies.js';
import { setupCaseStudy } from './case-study.js?v=2';

const home = document.querySelector('#home');
const catalog = document.querySelector('#cases');
const categoryNav = document.querySelector('#categories');
const results = document.querySelector('#catalog-results');
const catalogTitle = document.querySelector('#catalog-title');
const count = document.querySelector('#case-count');
const grid = document.querySelector('#case-grid');
const contact = document.querySelector('#contact-dialog');
const about = document.querySelector('#about-dialog');
const caseView = document.querySelector('#case-study');
const casePage = setupCaseStudy(caseView);
const all = 'Все';

setupDialog(contact);
setupDialog(about);

document.querySelector('#dock-actions').append(
  glassButton('Кейсы', { href: '#cases/web', width: 112, variant: 'dock' }),
  glassButton('Обо мне', { dialog: about, width: 112, variant: 'dock' }),
  glassButton('Написать', { dialog: contact, width: 138, variant: 'primary' }),
);
document.querySelector('#sidebar-contact-action').append(
  glassButton('Написать ↗', { dialog: contact, width: 170 }),
);

const toolFilters = document.querySelector('#tool-filters');
const pluralRules = new Intl.PluralRules('ru');
const countLabels = { one: 'проект', few: 'проекта', many: 'проектов', other: 'проекта' };
let category = categories[0];
let selectedTool = all;

function renderCases() {
  const matches = projects.filter(project =>
    project.category === category.id &&
    (selectedTool === all || project.tools.includes(selectedTool))
  );
  count.textContent = `${matches.length} ${countLabels[pluralRules.select(matches.length)]}`;

  if (matches.length) {
    grid.replaceChildren(...matches.map(project => caseCard({
      ...project,
      url: project.url ?? (project.caseId ? caseUrl(project.caseId) : undefined),
    })));
    return;
  }

  const empty = document.createElement('p');
  empty.className = 'visually-hidden';
  empty.textContent = projects.some(project => project.category === category.id)
    ? 'По выбранным фильтрам проектов нет.'
    : 'Кейсы появятся позже.';
  const placeholders = Array.from({ length: 4 }, () => caseCard());
  grid.replaceChildren(empty, ...placeholders);
}

function renderCategory(nextCategory) {
  category = nextCategory;
  catalogTitle.textContent = `${category.label} / Избранные работы`;

  for (const link of categoryNav.querySelectorAll('a')) {
    const active = link.hash === `#cases/${category.id}`;
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  selectedTool = all;
  filterGroup(toolFilters, 'Инструменты', category.toolRows, all, value => {
    selectedTool = value;
    results.scrollTop = 0;
    renderCases();
  });

  results.scrollTop = 0;
  renderCases();
}

for (const group of [categories.slice(0, 3), categories.slice(3)]) {
  categoryNav.append(buttonRow(group.map(item => glassButton(item.label, {
    href: `#cases/${item.id}`, width: item.width,
  }))));
}

let currentStudy;

function renderRoute(moveFocus = false) {
  const [view, id] = location.hash.slice(1).split('/');
  const study = view === 'case' ? caseStudies.find(item => item.id === id) : undefined;
  const showCases = view === 'cases' || (view === 'case' && !study);
  caseView.hidden = !study;
  catalog.hidden = !showCases;
  home.hidden = showCases || Boolean(study);
  if (study && study !== currentStudy) casePage.render(study);
  if (!study && currentStudy) casePage.closeMedia();
  if (showCases) renderCategory(categories.find(item => item.id === id) ?? categories[0]);
  currentStudy = study;
  document.title = study
    ? `${study.title} — Анастасия Кузнецова`
    : 'Анастасия Кузнецова — портфолио';

  if (moveFocus) {
    window.scrollTo(0, 0);
    let heading = document.querySelector('#hero-title');
    if (study) heading = casePage.title;
    else if (showCases) heading = catalogTitle;
    heading.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', () => renderRoute(true));
renderRoute();

const slider = document.querySelector('#telegram-link');
const handle = slider.querySelector('.contact__handle');
slider.href = telegramUrl;
let startX = null;
let travel = 0;
let distance = 0;
let moved = false;
let cancelClick = false;

slider.addEventListener('dragstart', event => event.preventDefault());
slider.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  cancelClick = false;
  if (!handle.contains(event.target)) return;
  startX = event.clientX;
  travel = slider.clientWidth - handle.offsetWidth - 16;
  distance = 0;
  moved = false;
  slider.setPointerCapture(event.pointerId);
});

slider.addEventListener('pointermove', event => {
  if (startX === null || !event.isPrimary) return;
  const offset = event.clientX - startX;
  moved ||= Math.abs(offset) > 6;
  if (!moved) return;
  distance = Math.max(0, Math.min(travel, offset));
  slider.classList.add('is-dragging');
  slider.style.setProperty('--handle-offset', `${distance}px`);
  slider.style.setProperty('--prompt-opacity', String(1 - distance / travel));
});

function releaseSlider() {
  startX = null;
  slider.classList.remove('is-dragging');
  slider.style.removeProperty('--handle-offset');
  slider.style.removeProperty('--prompt-opacity');
}

slider.addEventListener('pointerup', event => {
  if (startX === null || !event.isPrimary) return;
  const completed = moved && distance >= travel * 0.78;
  cancelClick = moved;
  releaseSlider();
  if (completed) location.assign(slider.href);
});
slider.addEventListener('pointercancel', releaseSlider);
slider.addEventListener('lostpointercapture', releaseSlider);
slider.addEventListener('click', event => {
  if (cancelClick && event.detail > 0) event.preventDefault();
  cancelClick = false;
});
