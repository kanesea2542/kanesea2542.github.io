'use strict';

function createImageViewer(prefix, imageId) {
  const viewport = document.getElementById(`${prefix}-viewport`);
  const stage = viewport.querySelector('.pan-stage');
  const img = document.getElementById(imageId);
  const output = document.getElementById(`${prefix}-zoom`);
  const plus = document.getElementById(`${prefix}-in`);
  const minus = document.getElementById(`${prefix}-out`);
  const fitButton = document.getElementById(`${prefix}-fit`);
  let zoom = 1;
  let fitScale = 1;
  let drag;

  function applyZoom(next, preserveCenter = true) {
    if (!img.naturalWidth || !viewport.clientWidth) return;
    const oldWidth = stage.offsetWidth;
    const oldHeight = stage.offsetHeight;
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / oldHeight;
    zoom = Math.max(1, Math.min(6, next));
    const width = Math.round(img.naturalWidth * fitScale * zoom);
    const height = Math.round(img.naturalHeight * fitScale * zoom);
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    stage.style.width = `${Math.max(viewport.clientWidth, width + 32)}px`;
    stage.style.height = `${Math.max(viewport.clientHeight, height + 32)}px`;
    if (preserveCenter) {
      viewport.scrollLeft = centerX * stage.offsetWidth - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * stage.offsetHeight - viewport.clientHeight / 2;
    } else {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
    }
    output.value = `${Math.round(zoom * 100)}%`;
    minus.disabled = zoom <= 1;
    plus.disabled = zoom >= 6;
  }

  function fit() {
    if (!img.naturalWidth || !viewport.clientWidth || !viewport.clientHeight) return;
    fitScale = Math.min((viewport.clientWidth - 32) / img.naturalWidth, (viewport.clientHeight - 32) / img.naturalHeight, 1);
    applyZoom(1, false);
  }

  plus.addEventListener('click', () => applyZoom(zoom * 1.5));
  minus.addEventListener('click', () => applyZoom(zoom / 1.5));
  fitButton.addEventListener('click', fit);
  img.addEventListener('load', fit);
  new ResizeObserver(fit).observe(viewport, {box:'border-box'});
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('dragging');
    viewport.focus({preventScroll:true});
    event.preventDefault();
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  });
  const endDrag = () => {drag = undefined;viewport.classList.remove('dragging');};
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  fit();
  return {fit};
}

if (document.getElementById('schematic-viewport')) createImageViewer('schematic', 'schematic-image');
if (document.getElementById('diagram-viewport')) createImageViewer('diagram', 'diagram-image');
if (document.getElementById('waveform-viewport')) createImageViewer('waveform', 'waveform-image');
if (document.getElementById('image-dialog')) {
const enlargedViewer = createImageViewer('image', 'detail-image');
const dialog = document.getElementById('image-dialog');
let opener;
document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
  opener = button;
  const img = document.getElementById('detail-image');
  img.alt = button.querySelector('img').alt;
  img.src = button.dataset.full;
  document.getElementById('image-caption').textContent = button.dataset.caption;
  document.getElementById('original-image').href = button.dataset.full;
  dialog.showModal();
  enlargedViewer.fit();
}));
dialog.querySelector('.image-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
}
