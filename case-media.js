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

  // Зум картинки: scale 1 — целиком по размеру сцены, до 6x с панорамированием.
  const ZOOM_MAX = 6;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  const pointers = new Map();
  let pinchStart = null;

  const media = () => stage.firstElementChild;
  const isImage = () => media() instanceof HTMLImageElement;

  function clampPan() {
    const node = media();
    if (!node) return;
    const box = stage.getBoundingClientRect();
    const maxX = Math.max(0, (node.clientWidth * scale - box.width) / 2 + 48);
    const maxY = Math.max(0, (node.clientHeight * scale - box.height) / 2 + 48);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }

  function applyZoom(animate = false) {
    const node = media();
    zoomOut.disabled = scale <= 1;
    zoomIn.disabled = scale >= ZOOM_MAX;
    zoomLevel.textContent = `${Math.round(scale * 100)}%`;
    if (!isImage()) return;
    node.classList.toggle('case-viewer__media--animated', animate);
    node.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    stage.classList.toggle('is-zoomed', scale > 1);
  }

  // origin — точка на экране, которая должна остаться под курсором/пальцами.
  function setZoom(next, origin, animate = false) {
    if (!isImage()) return;
    next = Math.min(ZOOM_MAX, Math.max(1, next));
    if (origin) {
      const box = stage.getBoundingClientRect();
      const px = origin.x - (box.left + box.width / 2);
      const py = origin.y - (box.top + box.height / 2);
      tx = px - (px - tx) * (next / scale);
      ty = py - (py - ty) * (next / scale);
    }
    scale = next;
    if (scale === 1) { tx = 0; ty = 0; }
    clampPan();
    applyZoom(animate);
  }

  function resetZoom() {
    scale = 1;
    tx = 0;
    ty = 0;
    pointers.clear();
    pinchStart = null;
    stage.classList.remove('is-zoomed');
  }

  function render() {
    const item = items[current];
    resetZoom();
    stage.replaceChildren(mediaElement(item));
    caption.textContent = item.caption ?? item.alt ?? '';
    const single = items.length < 2;
    const zoomable = item.type === 'image';
    previous.hidden = next.hidden = counter.hidden = single;
    zoom.hidden = !zoomable;
    controls.hidden = single && !zoomable;
    counter.textContent = `${current + 1} / ${items.length}`;
    applyZoom();
  }

  function move(step) {
    current = (current + step + items.length) % items.length;
    render();
  }

  const previous = glassButton('←', { onClick: () => move(-1) });
  previous.setAttribute('aria-label', 'Предыдущий материал');
  const next = glassButton('→', { onClick: () => move(1) });
  next.setAttribute('aria-label', 'Следующий материал');

  const zoomOut = glassButton('−', { onClick: () => setZoom(scale / 1.4, undefined, true) });
  zoomOut.setAttribute('aria-label', 'Отдалить');
  const zoomLevel = glassButton('100%', { onClick: () => setZoom(1, undefined, true) });
  zoomLevel.setAttribute('aria-label', 'Сбросить масштаб');
  const zoomIn = glassButton('+', { onClick: () => setZoom(scale * 1.4, undefined, true) });
  zoomIn.setAttribute('aria-label', 'Приблизить');
  const zoom = document.createElement('div');
  zoom.className = 'case-viewer__zoom';
  zoom.append(zoomOut, zoomLevel, zoomIn);

  controls.prepend(previous);
  controls.append(zoom, next);
  setupDialog(dialog);

  // Колёсико мыши — зум к точке под курсором.
  stage.addEventListener('wheel', event => {
    if (!isImage()) return;
    event.preventDefault();
    setZoom(scale * Math.pow(1.0015, -event.deltaY), { x: event.clientX, y: event.clientY });
  }, { passive: false });

  // Двойной клик/тап — переключение 1x ↔ 2.5x.
  stage.addEventListener('dblclick', event => {
    if (!isImage()) return;
    event.preventDefault();
    setZoom(scale > 1 ? 1 : 2.5, { x: event.clientX, y: event.clientY }, true);
  });

  // Жесты: один палец — панорама при зуме, два — щипок.
  stage.addEventListener('pointerdown', event => {
    if (!isImage()) return;
    stage.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
    }
  });
  stage.addEventListener('pointermove', event => {
    const prev = pointers.get(event.pointerId);
    if (!prev) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      setZoom(pinchStart.scale * Math.hypot(a.x - b.x, a.y - b.y) / pinchStart.distance,
        { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    } else if (pointers.size === 1 && scale > 1) {
      tx += event.clientX - prev.x;
      ty += event.clientY - prev.y;
      clampPan();
      applyZoom();
    }
  });
  const endPointer = event => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchStart = null;
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  dialog.addEventListener('keydown', event => {
    if (event.target instanceof HTMLVideoElement) return;
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setZoom(scale * 1.25, undefined, true);
    } else if (event.key === '-') {
      event.preventDefault();
      setZoom(scale / 1.25, undefined, true);
    } else if (event.key === '0') {
      event.preventDefault();
      setZoom(1, undefined, true);
    } else if (items.length >= 2 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    stage.replaceChildren();
    items = [];
    resetZoom();
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
