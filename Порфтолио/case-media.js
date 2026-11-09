import { glassButton, setupDialog } from './components.js';

function mediaElement(item, preview = false) {
  if (item.type === 'image' || (preview && item.poster)) {
    const image = document.createElement('img');
    image.src = item.type === 'image' ? item.src : item.poster;
    image.alt = preview ? '' : item.alt ?? '';
    if (preview) image.loading = 'lazy';
    return image;
  }

  const video = document.createElement('video');
  video.src = item.src;
  video.preload = 'metadata';
  video.playsInline = true;
  video.controls = !preview;
  video.muted = preview;
  if (item.poster) video.poster = item.poster;
  if (!preview && item.captions) {
    const track = document.createElement('track');
    track.kind = 'captions';
    track.src = item.captions;
    track.srclang = 'ru';
    track.label = 'Русский';
    video.append(track);
  }
  return video;
}

export function createMediaViewer(dialog) {
  const stage = dialog.querySelector('.case-viewer__stage');
  const caption = dialog.querySelector('.case-viewer__caption');
  const controls = dialog.querySelector('.case-viewer__controls');
  const counter = dialog.querySelector('.case-viewer__counter');
  let items = [];
  let current = 0;

  function render() {
    const item = items[current];
    stage.replaceChildren(mediaElement(item));
    caption.textContent = item.caption ?? item.alt ?? '';
    controls.hidden = items.length < 2;
    counter.textContent = `${current + 1} / ${items.length}`;
  }

  function move(step) {
    current = (current + step + items.length) % items.length;
    render();
  }

  const previous = glassButton('←', { onClick: () => move(-1) });
  previous.setAttribute('aria-label', 'Предыдущий материал');
  const next = glassButton('→', { onClick: () => move(1) });
  next.setAttribute('aria-label', 'Следующий материал');
  controls.prepend(previous);
  controls.append(next);
  setupDialog(dialog);

  dialog.addEventListener('keydown', event => {
    if (items.length < 2 || event.target instanceof HTMLVideoElement) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    stage.replaceChildren();
    items = [];
  });

  return (gallery, index) => {
    items = gallery;
    current = index;
    render();
    dialog.showModal();
  };
}

export function caseGallery(items, { overview = false, open } = {}) {
  const gallery = document.createElement('div');
  gallery.className = overview ? 'case-gallery case-gallery--overview' : 'case-gallery';
  const entries = overview && items.length === 0 ? [null, null, null] : items;
  if (entries.length >= 3 && overview) gallery.classList.add('case-gallery--mosaic');
  if (entries.length === 1) gallery.classList.add('case-gallery--single');
  if (!overview && entries.length && entries.every(item => item.layout === 'portrait')) {
    gallery.classList.add('case-gallery--portraits');
  }
  if (items.length === 0) gallery.setAttribute('aria-hidden', 'true');

  for (const [index, item] of entries.entries()) {
    const slot = document.createElement(item ? 'button' : 'div');
    slot.className = 'case-gallery__slot';
    if (item) {
      const type = item.type === 'video' ? 'видео' : 'изображение';
      const label = item.caption || item.alt;
      slot.type = 'button';
      slot.setAttribute('aria-haspopup', 'dialog');
      slot.setAttribute('aria-label', `Открыть ${type} ${label ? `«${label}»` : index + 1}`);
      slot.append(mediaElement(item, true));
      if (item.type === 'video') {
        const badge = document.createElement('span');
        badge.className = 'case-gallery__play';
        badge.textContent = '▶';
        badge.setAttribute('aria-hidden', 'true');
        slot.append(badge);
      }
      slot.addEventListener('click', () => open(items, index));
    }
    if (!overview && item?.caption) {
      const figure = document.createElement('figure');
      figure.className = 'case-gallery__item';
      const caption = document.createElement('figcaption');
      caption.className = 'case-gallery__caption';
      caption.textContent = item.caption;
      figure.append(slot, caption);
      gallery.append(figure);
    } else {
      gallery.append(slot);
    }
  }
  return gallery;
}
