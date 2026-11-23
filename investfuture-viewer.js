import { investFutureScenarios } from './investfuture-scenarios.js';

const assets = './assets/investfuture-update';
const number = value => String(value).padStart(2, '0');
const scenarioList = Object.entries(investFutureScenarios);
const shortNames = ['Онбординг', 'Поиск', 'Лента', 'Подписка', 'Обучение', 'Профиль'];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, action, className = 'if-viewer__button') {
  const control = element('button', className, text);
  control.type = 'button';
  control.addEventListener('click', action);
  return control;
}

function image(file, alt = '') {
  const node = element('img');
  node.src = `${assets}/${file}`;
  node.alt = alt;
  return node;
}

function makeViewer() {
  const dialog = element('dialog', 'if-viewer');
  const zoom = element('dialog', 'if-viewer if-viewer--zoom');
  const header = element('header', 'if-viewer__header');
  const counter = element('p', 'if-label');
  counter.setAttribute('aria-live', 'polite');
  const title = element('h2');
  title.id = 'if-viewer-title';
  dialog.setAttribute('aria-labelledby', title.id);
  const identity = element('div');
  identity.append(counter, title);
  const close = button(undefined, () => dialog.close());
  close.append(element('span', 'if-desktop-label', 'Закрыть ×'), element('span', 'if-mobile-label', 'К кейсу'));
  const mobileCounter = element('p', 'if-label if-mobile-label', 'INVESTFUTURE / СЦЕНАРИИ');
  identity.prepend(mobileCounter);
  close.autofocus = true;
  header.append(identity, close);

  const layout = element('div', 'if-viewer__layout');
  const scenarios = element('nav', 'if-viewer__choices if-viewer__scenarios');
  scenarios.setAttribute('aria-label', 'Сценарии');
  const stepList = element('nav', 'if-viewer__choices if-viewer__steps');
  stepList.setAttribute('aria-label', 'Шаги');
  const stepCount = element('p', 'if-label');
  const stepButtons = element('div', 'if-viewer__choices');
  stepList.append(stepCount, stepButtons);

  const stage = element('div', 'if-viewer__stage');
  const mobileTitle = element('p', 'if-viewer__mobile-title if-mobile-label');
  const screen = element('img', 'if-viewer__screen');
  const stepTitle = element('h3');
  const caption = element('p', 'if-copy');
  const navigation = element('div', 'if-viewer__navigation');
  const previous = button('← Назад', () => showStep(index - 1));
  const next = button('Дальше →', () => showStep(index + 1));
  const expand = button('Увеличить ↗', () => {
    zoomTitle.textContent = stepTitle.textContent;
    zoomImage.src = screen.src;
    zoomImage.alt = screen.alt;
    zoom.showModal();
  });
  expand.setAttribute('aria-haspopup', 'dialog');
  navigation.append(previous, next, expand);
  stage.append(mobileTitle, screen, stepTitle, caption, navigation);
  layout.append(scenarios, stage, stepList);
  dialog.append(header, layout);

  const zoomTitle = element('h2');
  zoomTitle.id = 'if-zoom-title';
  zoom.setAttribute('aria-labelledby', zoomTitle.id);
  const zoomHeader = element('header', 'if-viewer__header');
  const closeZoom = button('Закрыть ×', () => zoom.close());
  closeZoom.autofocus = true;
  zoomHeader.append(zoomTitle, closeZoom);
  const zoomImage = element('img', 'if-viewer__zoom-image');
  zoom.append(zoomHeader, zoomImage);
  for (const modal of [dialog, zoom]) {
    modal.addEventListener('click', event => {
      if (event.target === modal) {
        const box = modal.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right ||
            event.clientY < box.top || event.clientY > box.bottom) modal.close();
      }
    });
  }

  let active;
  let index = 0;

  function showStep(nextIndex) {
    const step = active.steps[nextIndex];
    if (!step) return;
    index = nextIndex;
    const [name, text, file] = step;
    counter.textContent = `INVESTFUTURE / ${active.position} ИЗ ${scenarioList.length} / ШАГ ${index + 1} ИЗ ${active.steps.length}`;
    mobileTitle.textContent = `${active.title} · ${index + 1}/${active.steps.length}`;
    screen.src = `${assets}/${file}`;
    screen.alt = name;
    stepTitle.textContent = name;
    caption.textContent = text;
    previous.disabled = index === 0;
    next.disabled = index === active.steps.length - 1;
    [...stepButtons.children].forEach((control, i) => control.setAttribute('aria-pressed', String(i === index)));
  }

  function selectScenario(id, initialIndex) {
    active = investFutureScenarios[id];
    title.textContent = active.title;
    stepCount.textContent = `ШАГИ · ${active.steps.length}`;
    scenarioControls.forEach((control, i) => control.setAttribute('aria-pressed', String(scenarioList[i][0] === id)));
    stepButtons.replaceChildren(...active.steps.map(([name], i) => {
      const label = `${number(i + 1)} · ${name}`;
      const control = button(undefined, () => showStep(i));
      control.setAttribute('aria-label', label);
      control.append(element('span', 'if-desktop-label', label), element('span', 'if-mobile-label', number(i + 1)));
      return control;
    }));
    showStep(initialIndex);
    dialog.scrollTop = 0;
  }

  const scenarioControls = scenarioList.map(([id, flow], i) => {
    const control = button(undefined, () => selectScenario(id, 0));
    control.setAttribute('aria-label', flow.title);
    control.append(element('span', 'if-desktop-label', flow.title), element('span', 'if-mobile-label', shortNames[i]));
    return control;
  });
  scenarios.append(element('p', 'if-label', 'СЦЕНАРИИ'), ...scenarioControls);
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showStep(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  return {
    dialog,
    zoom,
    open(id, step) {
      selectScenario(id, step - 1);
      dialog.showModal();
    },
  };
}

export function createInvestFutureBlockRenderer() {
  let viewer;
  const open = (id, step = 1) => viewer.open(id, step);

  function render(block) {
    if (block.type === 'cards') {
      const grid = element('div', `if-cards if-cards--${block.tone ?? 'default'}`);
      grid.style.setProperty('--columns', block.cols);
      for (const item of block.cards) {
        const card = item.flow
          ? button(undefined, () => open(item.flow, item.step), 'if-card if-card--action')
          : element('div', 'if-card');
        if (item.flow) card.setAttribute('aria-haspopup', 'dialog');
        if (item.image) {
          const badge = image(item.image);
          badge.loading = 'lazy';
          card.append(badge);
        }
        if (item.eyebrow) card.append(element('span', 'if-label', item.eyebrow));
        card.append(element('strong', 'if-card__title', item.title), element('span', 'if-copy', item.text));
        if (item.note) card.append(element('span', 'if-label', item.note));
        if (block.cols === 3 && item.flow) {
          const count = investFutureScenarios[item.flow].steps.length;
          card.append(element('span', 'if-label', `${count} ${count === 4 ? 'шага' : 'шагов'} ↗`));
        }
        grid.append(card);
      }
      return grid;
    }
    if (block.type === 'stack') {
      const stack = element('div', `if-stack if-stack--${block.tone}`);
      stack.append(...block.blocks.map(render));
      return stack;
    }
    if (block.type === 'heading') return element('h3', 'case-section__subheading', block.text);
    if (block.type === 'label') return element('p', 'if-label', block.text);
    if (block.type === 'footnote') return element('p', 'if-copy', block.text);
    if (block.type === 'scenario-preview') {
      viewer = makeViewer();
      const preview = element('div', 'if-preview');
      const thumbnail = button(undefined, () => open('onboarding'), 'if-preview__screen');
      thumbnail.setAttribute('aria-label', 'Открыть просмотрщик онбординга');
      thumbnail.setAttribute('aria-haspopup', 'dialog');
      const poster = image(block.image);
      poster.loading = 'lazy';
      thumbnail.append(poster);
      const details = element('div', 'if-preview__details');
      const launch = button('Открыть просмотрщик ↗', () => open('onboarding'));
      launch.setAttribute('aria-haspopup', 'dialog');
      details.append(
        element('p', 'if-label', block.eyebrow),
        element('h3', 'case-section__subheading', block.title),
        element('p', 'if-copy', block.text),
        launch,
      );
      preview.append(thumbnail, details, viewer.dialog, viewer.zoom);
      return preview;
    }
  }

  return render;
}
