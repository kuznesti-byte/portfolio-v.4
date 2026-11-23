import { caseCard, glassButton, setupDialog } from './components.js?v=5';
import { projects, telegramUrl } from './portfolio-data.js?v=6';
import { caseStudies, caseUrl } from './case-studies.js?v=6';
import { setupCaseStudy } from './case-study.js?v=6';

const home = document.querySelector('#home');
const catalog = document.querySelector('#cases');
const results = document.querySelector('#catalog-results');
const catalogTitle = document.querySelector('#catalog-title');
const count = document.querySelector('#case-count');
const grid = document.querySelector('#case-grid');
const contact = document.querySelector('#contact-dialog');
const about = document.querySelector('#about-dialog');
const caseView = document.querySelector('#case-study');
const casePage = setupCaseStudy(caseView);

setupDialog(contact);
setupDialog(about);

document.querySelector('#dock-actions').append(
  glassButton('Кейсы', { href: '#cases/all', width: 112, variant: 'dock' }),
  glassButton('Обо мне', { dialog: about, width: 112, variant: 'dock' }),
  glassButton('Написать', { dialog: contact, width: 138, variant: 'primary' }),
);
document.querySelector('#sidebar-contact-action').append(
  glassButton('Написать ↗', { dialog: contact, width: 170 }),
);

const pluralRules = new Intl.PluralRules('ru');
const countLabels = { one: 'проект', few: 'проекта', many: 'проектов', other: 'проекта' };

function renderCases() {
  count.textContent = `${projects.length} ${countLabels[pluralRules.select(projects.length)]}`;
  grid.replaceChildren(...projects.map(project => caseCard({
    ...project,
    url: project.url ?? (project.caseId ? caseUrl(project.caseId) : undefined),
  })));
  results.scrollTop = 0;
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
  if (showCases) renderCases();
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
