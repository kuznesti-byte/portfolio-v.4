import { caseGallery, createMediaViewer } from './case-media.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function resourceLink({ href, label }) {
  const link = element('a', 'case-study__resource', label);
  const arrow = element('span', null, '↗');
  arrow.setAttribute('aria-hidden', 'true');
  link.append(arrow);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export function setupCaseStudy(view) {
  const title = view.querySelector('#case-study-title');
  const subtitle = view.querySelector('.case-study__subtitle');
  const tags = view.querySelector('.case-tags');
  const back = view.querySelector('.case-study__back');
  const top = view.querySelector('.case-study__top');
  const scroll = view.querySelector('.case-study__scroll');
  const overview = view.querySelector('.case-study__overview');
  const menu = view.querySelector('.case-study__menu');
  const sections = view.querySelector('.case-study__sections');
  const viewer = document.querySelector('#case-viewer');
  const openMedia = createMediaViewer(viewer);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const curtain = view.querySelector('.case-study__backdrop').cloneNode(true);
  curtain.classList.add('case-study__curtain');
  curtain.hidden = true;
  view.append(curtain);
  curtain.addEventListener('animationend', event => {
    if (event.target === curtain) curtain.hidden = true;
  });

  let entries = [];
  let activeEntry;
  let destination;

  function setActive(entry) {
    if (activeEntry === entry) return;
    activeEntry?.link.removeAttribute('aria-current');
    entry?.link.setAttribute('aria-current', 'location');
    activeEntry = entry;
  }

  function goTo(entry) {
    if (entry) setActive(entry);
    const targetTop = entry ? entry.heading.offsetTop - 28 : 0;
    destination = Math.min(Math.max(0, targetTop), scroll.scrollHeight - scroll.clientHeight);
    (entry?.heading ?? title).focus({ preventScroll: true });
    scroll.scrollTo({ top: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  top.addEventListener('click', () => goTo());
  scroll.addEventListener('scroll', () => {
    top.hidden = scroll.scrollTop < 96;
  }, { passive: true });
  scroll.addEventListener('scrollend', () => {
    if (destination !== undefined && Math.abs(destination - scroll.scrollTop) < 2) {
      destination = undefined;
      return;
    }
    destination = undefined;
    const readingLine = scroll.scrollTop + 32;
    const atEnd = scroll.scrollTop > 0 && scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 1;
    setActive(atEnd ? entries.at(-1) : entries.findLast(entry => entry.heading.offsetTop <= readingLine));
  });

  function closeMedia() {
    if (viewer.open) viewer.close();
  }

  function render(study) {
    closeMedia();
    title.textContent = study.title;
    subtitle.textContent = study.subtitle;
    back.href = `#cases/${study.category}`;

    tags.replaceChildren(...study.tags.map(tag => {
      const style = tag.featured ? 'primary' : 'dock';
      const pill = element('li', `glass-button glass-button--${style} case-tag`, tag.label);
      if (tag.width) pill.style.setProperty('--button-width', `${tag.width}px`);
      return pill;
    }));
    tags.hidden = study.tags.length === 0;

    entries = study.sections.map(item => {
      const section = element('section', 'case-section');
      section.id = `case-section-${item.id}`;
      const heading = element('h2', 'case-section__title', item.title);
      heading.tabIndex = -1;
      section.append(heading);
      for (const block of item.blocks) {
        if (block.type === 'media' && block.items.length) {
          section.append(caseGallery(block.items, { open: openMedia }));
        } else if (block.type === 'text') {
          const paragraph = element('p', 'case-section__text', block.text);
          if (block.label) paragraph.prepend(element('strong', null, `${block.label}. `));
          section.append(paragraph);
        } else if (block.type === 'list') {
          const list = element('ul', 'case-section__list');
          list.append(...block.items.map(text => element('li', null, text)));
          section.append(list);
        } else if (block.type === 'link') {
          section.append(resourceLink(block));
        }
      }
      const link = element('button', 'case-study__section-link', item.title);
      link.type = 'button';
      link.setAttribute('aria-controls', section.id);
      const entry = { link, section, heading };
      link.addEventListener('click', () => goTo(entry));
      return entry;
    });

    menu.replaceChildren(...entries.map(entry => {
      const listItem = document.createElement('li');
      listItem.append(entry.link);
      return listItem;
    }));
    sections.replaceChildren(...entries.map(entry => entry.section));
    overview.replaceChildren(caseGallery(study.gallery, { overview: true, open: openMedia }));
    if (study.galleryLink) overview.append(resourceLink(study.galleryLink));

    setActive();
    destination = undefined;
    scroll.scrollTop = 0;
    top.hidden = true;
    curtain.hidden = reducedMotion.matches;
  }

  return { render, title, closeMedia };
}
