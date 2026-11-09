export function glassButton(label, { href, onClick, dialog, width, active, variant } = {}) {
  const control = document.createElement(href ? 'a' : 'button');
  control.className = 'glass-button';
  control.textContent = label;
  if (href) {
    control.href = href;
    if (active) control.setAttribute('aria-current', 'page');
  } else {
    control.type = 'button';
    if (active !== undefined) control.setAttribute('aria-pressed', String(active));
  }
  if (width) control.style.setProperty('--button-width', `${width}px`);
  if (variant) control.classList.add(`glass-button--${variant}`);
  if (dialog) {
    control.setAttribute('aria-haspopup', 'dialog');
    control.setAttribute('aria-controls', dialog.id);
    control.addEventListener('click', () => dialog.showModal());
  }
  if (onClick) control.addEventListener('click', onClick);
  return control;
}

export function buttonRow(controls) {
  const row = document.createElement('div');
  row.className = 'button-row';
  row.append(...controls);
  return row;
}

const filterWidths = {
  Все: 52,
  Figma: 64, Tilda: 64, Codex: 64, Claude: 71.2,
};

export function filterGroup(container, label, rows, selected, onSelect) {
  const heading = document.createElement('p');
  heading.className = 'eyebrow';
  heading.textContent = label;
  const buttons = rows.map(row => buttonRow(row.map(value => glassButton(value, {
    width: filterWidths[value],
    active: selected === value,
    onClick: () => {
      for (const control of container.querySelectorAll('button')) {
        control.setAttribute('aria-pressed', String(control.textContent === value));
      }
      onSelect(value);
    },
  }))));
  container.replaceChildren(heading, ...buttons);
}

export function caseCard(project) {
  const card = document.querySelector('#case-card-template').content.firstElementChild.cloneNode(true);
  const title = card.querySelector('.case-card__title');
  const meta = card.querySelector('.case-card__meta');
  const cover = card.querySelector('.case-card__cover');

  if (!project) {
    card.classList.add('case-card--placeholder');
    card.setAttribute('aria-hidden', 'true');
    title.textContent = 'Скоро';
    meta.textContent = 'Место для кейса';
    return card;
  }

  title.textContent = project.title;
  meta.textContent = [project.format, ...project.tools].join(' · ');
  if (project.cover) {
    const image = document.createElement('img');
    image.src = project.cover;
    image.alt = '';
    image.loading = 'lazy';
    cover.append(image);
  }
  if (project.url) {
    const link = document.createElement('a');
    link.href = project.url;
    link.textContent = project.title;
    title.replaceChildren(link);
  }
  return card;
}

export function setupDialog(dialog) {
  const close = document.createElement('button');
  close.className = 'dialog-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Закрыть');
  close.autofocus = true;

  const image = document.createElement('img');
  image.src = './assets/close.svg';
  image.width = 24;
  image.height = 24;
  image.alt = '';
  close.append(image);
  close.addEventListener('click', () => dialog.close());
  dialog.append(close);

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
