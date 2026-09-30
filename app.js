import { chapters } from './chapters.js';

const $ = (id) => document.getElementById(id);
const sections = [...document.querySelectorAll('.chapter')];
const sceneLayers = [...document.querySelectorAll('.art-layer')];
const chapterLinks = [...document.querySelectorAll('.chapter-nav a')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const pointerDevice = matchMedia('(hover: hover) and (pointer: fine)');
const snow = $('snow');
const context = snow.getContext('2d');
const SNOW_COUNT_DESKTOP = 58;
const SNOW_COUNT_MOBILE = 25;
const FRAME_INTERVAL_MS = 1000 / 30;
const state = { chapter: 'harbin', paused: reducedMotion.matches, manualMotion: false, frame: 0, scrollFrame: 0, lastFrame: 0, width: 0, height: 0, flakes: [], lastNoteTrigger: null };

function closeNote(restoreFocus = false) {
  $('scene-note').hidden = true;
  document.querySelectorAll('[data-open-note]').forEach((link) => link.setAttribute('aria-expanded', 'false'));
  if (restoreFocus) state.lastNoteTrigger?.focus({ preventScroll: true });
}

function closeAbout(restoreFocus = false) {
  $('about-book').hidden = true;
  $('about-toggle').setAttribute('aria-expanded', 'false');
  if (restoreFocus) $('about-toggle').focus({ preventScroll: true });
}

function checkActiveArt() {
  const image = document.querySelector(`.art-layer[data-art="${state.chapter === 'memories' ? 'mohe' : state.chapter}"] img`);
  $('art-error').hidden = !image?.dataset.failed;
}

function activateChapter(id) {
  if (state.chapter === id) return;
  state.chapter = id;
  const artId = id === 'memories' ? 'mohe' : id;
  document.body.dataset.chapter = id;
  document.body.classList.toggle('night-scene', id !== 'harbin');
  document.body.classList.toggle('day-scene', id === 'harbin');
  sceneLayers.forEach((layer) => layer.classList.toggle('is-visible', layer.dataset.art === artId));
  chapterLinks.forEach((link) => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  $('scroll-label').textContent = id === 'memories' ? '故事未完，等我们续写' : '滚动，翻开下一幕';
  closeNote();
  checkActiveArt();
}

function updateScroll() {
  state.scrollFrame = 0;
  const readingPoint = innerHeight * .44;
  let active = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= readingPoint) active = section;
  }
  activateChapter(active.id);
  const progress = Math.max(.015, Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
  $('reading-progress').style.setProperty('--progress', progress);
  if (!state.paused) {
    const localProgress = Math.max(0, Math.min(1, -active.getBoundingClientRect().top / innerHeight));
    document.documentElement.style.setProperty('--scene-scale', (1.015 + localProgress * .032).toFixed(3));
  }
}

function navigateTo(id, updateHistory = true) {
  const section = $(id);
  if (!section?.classList.contains('chapter')) return;
  closeAbout();
  closeNote();
  if (updateHistory) history.pushState(null, '', `#${id}`);
  window.scrollTo({ top: section.offsetTop, behavior: state.paused ? 'auto' : 'smooth' });
}

for (const link of document.querySelectorAll('a[href^="#"]:not([data-open-note])')) {
  link.addEventListener('click', (event) => {
    if (!$(link.hash.slice(1))?.classList.contains('chapter')) return;
    event.preventDefault();
    navigateTo(link.hash.slice(1));
    if (link.classList.contains('skip-link')) {
      const title = $('harbin-title');
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  });
}
window.addEventListener('popstate', () => navigateTo(location.hash.slice(1) || 'harbin', false));
window.addEventListener('scroll', () => {
  if (!state.scrollFrame) state.scrollFrame = requestAnimationFrame(updateScroll);
}, { passive: true });

for (const trigger of document.querySelectorAll('[data-open-note]')) {
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'scene-note');
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    const entry = chapters.find((chapter) => chapter.id === trigger.dataset.openNote);
    if (!entry) return;
    const wasOpen = !$('scene-note').hidden && state.lastNoteTrigger === trigger;
    closeAbout();
    closeNote();
    if (wasOpen) return;
    state.lastNoteTrigger = trigger;
    $('note-location').textContent = entry.location;
    $('note-title').textContent = entry.note.title;
    $('note-body').textContent = entry.note.body;
    $('scene-note').hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    $('note-title').focus({ preventScroll: true });
  });
}
$('close-note').addEventListener('click', () => closeNote(true));
$('about-toggle').addEventListener('click', () => {
  if (!$('about-book').hidden) { closeAbout(true); return; }
  closeNote();
  $('about-book').hidden = false;
  $('about-toggle').setAttribute('aria-expanded', 'true');
  $('about-book').querySelector('h2').focus({ preventScroll: true });
});
$('close-about').addEventListener('click', () => closeAbout(true));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!$('scene-note').hidden) closeNote(true);
  else if (!$('about-book').hidden) closeAbout(true);
});

// 景深由不同速度、尺寸的雪粒和轻微视差构成；图片本身不是三维模型。
function resetSnow() {
  state.width = innerWidth;
  state.height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  snow.width = Math.round(state.width * ratio);
  snow.height = Math.round(state.height * ratio);
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = innerWidth < 700 ? SNOW_COUNT_MOBILE : SNOW_COUNT_DESKTOP;
  state.flakes = Array.from({ length: count }, () => ({ x: Math.random() * state.width, y: Math.random() * state.height, depth: .25 + Math.random() * .75, phase: Math.random() * Math.PI * 2 }));
}

function drawSnow(time) {
  state.frame = 0;
  if (state.paused || document.hidden || !context) return;
  if (time - state.lastFrame >= FRAME_INTERVAL_MS) {
    const step = Math.min(2, (time - (state.lastFrame || time)) / FRAME_INTERVAL_MS);
    state.lastFrame = time;
    context.clearRect(0, 0, state.width, state.height);
    for (const flake of state.flakes) {
      flake.y += (.3 + flake.depth * .7) * step;
      flake.x += Math.sin(time * .0002 + flake.phase) * .25 * step;
      if (flake.y > state.height + 5) { flake.y = -5; flake.x = Math.random() * state.width; }
      context.beginPath();
      context.fillStyle = `rgba(255,250,238,${.25 + flake.depth * .5})`;
      context.arc(flake.x, flake.y, .5 + flake.depth * 1.5, 0, Math.PI * 2);
      context.fill();
    }
  }
  state.frame = requestAnimationFrame(drawSnow);
}

function setMotion(paused) {
  state.paused = paused;
  document.body.classList.toggle('motion-paused', paused);
  $('motion-toggle').setAttribute('aria-pressed', String(paused));
  $('motion-toggle').querySelector('span').textContent = paused ? '开启动效' : '暂停动态';
  cancelAnimationFrame(state.frame);
  state.frame = 0;
  context?.clearRect(0, 0, state.width, state.height);
  if (!paused && !document.hidden) { state.lastFrame = 0; state.frame = requestAnimationFrame(drawSnow); }
}
$('motion-toggle').addEventListener('click', () => { state.manualMotion = true; setMotion(!state.paused); });
reducedMotion.addEventListener('change', () => { if (!state.manualMotion) setMotion(reducedMotion.matches); });
document.addEventListener('visibilitychange', () => { setMotion(state.paused); });
window.addEventListener('resize', () => { resetSnow(); updateScroll(); }, { passive: true });
window.addEventListener('pointermove', (event) => {
  if (state.paused || !pointerDevice.matches) return;
  const x = event.clientX / innerWidth - .5;
  const y = event.clientY / innerHeight - .5;
  const style = document.documentElement.style;
  style.setProperty('--pan-x', `${x * -10}px`);
  style.setProperty('--pan-y', `${y * -7}px`);
  style.setProperty('--turn-x', `${y * .6}deg`);
  style.setProperty('--turn-y', `${x * -.8}deg`);
}, { passive: true });

for (const image of document.querySelectorAll('.art-layer img')) {
  image.addEventListener('error', () => { image.dataset.failed = 'true'; checkActiveArt(); });
  image.addEventListener('load', () => { delete image.dataset.failed; checkActiveArt(); });
  if (image.complete && !image.naturalWidth) image.dataset.failed = 'true';
}
$('retry-art').addEventListener('click', () => {
  document.querySelectorAll('.art-layer img[data-failed]').forEach((image) => {
    const url = new URL(image.src);
    url.searchParams.set('retry', Date.now());
    image.src = url.href;
  });
});

resetSnow();
setMotion(state.paused);
updateScroll();
checkActiveArt();
