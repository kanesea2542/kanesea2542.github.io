'use strict';

const projectData = {
  convolution: {
    title: '2D Convolution Accelerator', category: 'Hardware acceleration / SystemVerilog', status: 'In progress',
    description: 'Since August 2026, I have been designing a synthesizable SystemVerilog hardware accelerator for 2D convolution, translating the computational algorithm into register-transfer-level digital logic.',
    focus: 'Developing modular RTL components and verifying them with SystemVerilog testbenches and randomized simulation in Siemens QuestaSim. Synthesis work uses Synopsys Design Compiler targeting the Nangate 45 nm standard-cell library to evaluate the hardware implementation.',
    context: '2D convolution applies a kernel across input data to generate an output.'
  },
  adder: {
    title: 'Pipelined Carry-Select Adder', category: 'Integrated circuits / Cadence', status: 'In progress',
    description: 'A current project designing a pipelined, synchronous 8-bit carry-select adder in Cadence, connecting datapath design with VLSI design methodologies.',
    focus: 'Synchronous arithmetic hardware, pipelining, and integrated circuit design in Cadence.',
    context: 'Carry-select architectures calculate candidate sums for different carry inputs and select the appropriate result.'
  }
};

document.getElementById('year').textContent = new Date().getFullYear();

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  cards.forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) count++;
  });
  document.getElementById('filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
}));

const dialog = document.getElementById('project-dialog');
let dialogTrigger;
document.querySelectorAll('.project-open[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projectData[button.dataset.project];
  dialogTrigger = button;
  document.getElementById('dialog-title').textContent = project.title;
  document.getElementById('dialog-category').textContent = project.category;
  document.getElementById('dialog-description').textContent = project.description;
  const details = document.getElementById('dialog-details');
  details.replaceChildren();
  [['h3', 'Project status'], ['p', project.status], ['h3', 'Technical focus'], ['p', project.focus], ['h3', 'The concept'], ['p', project.context]].forEach(([tag, text]) => {
    const element = document.createElement(tag);
    element.textContent = text;
    details.append(element);
  });
  dialog.showModal();
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => dialogTrigger?.focus());

// Sparse, low-contrast particles: no pointer tracking, no network requests.
const canvas = document.getElementById('particles');
const context = canvas.getContext('2d');
const motionButton = document.getElementById('motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let userPaused = false;
try { userPaused = localStorage.getItem('portfolio-motion-paused') === 'true'; } catch { /* Storage is optional. */ }
let points = [];
let frame = 0;
let previousTime = 0;
let width = 0;
let height = 0;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  points = Array.from({ length: Math.min(42, Math.floor(width * height / 27000)) }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    radius: Math.random() * .8 + .4, speed: Math.random() * 4 + 2,
    alpha: Math.random() * .24 + .14
  }));
  paint(0);
}

function paint(delta) {
  if (!context) return;
  context.clearRect(0, 0, width, height);
  points.forEach(point => {
    point.y -= point.speed * delta;
    if (point.y < -3) point.y = height + 3;
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(197,174,130,${point.alpha})`;
    context.fill();
  });
}

function animate(time) {
  paint(previousTime ? Math.min((time - previousTime) / 1000, .05) : 0);
  previousTime = time;
  frame = requestAnimationFrame(animate);
}

function updateMotion() {
  cancelAnimationFrame(frame);
  previousTime = 0;
  const paused = userPaused || reducedMotion.matches;
  document.body.classList.toggle('motion-paused', paused);
  motionButton.textContent = reducedMotion.matches ? 'Motion: reduced' : `Motion: ${paused ? 'off' : 'on'}`;
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', reducedMotion.matches ? 'Animation disabled by your device’s reduced motion preference' : paused ? 'Enable background animation' : 'Pause background animation');
  motionButton.disabled = reducedMotion.matches;
  if (!paused && !document.hidden && context) frame = requestAnimationFrame(animate);
}

motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  try { localStorage.setItem('portfolio-motion-paused', String(userPaused)); } catch { /* Storage is optional. */ }
  updateMotion();
});
window.addEventListener('resize', resizeCanvas, { passive: true });
document.addEventListener('visibilitychange', updateMotion);
reducedMotion.addEventListener('change', updateMotion);
resizeCanvas();
updateMotion();
