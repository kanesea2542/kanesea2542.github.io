import { createBoardScene } from './board-scene.js';
const host=document.getElementById('board-model');
const status=document.getElementById('model-status');
const buttons=document.querySelectorAll('[data-model-view],[data-model-zoom]');
buttons.forEach(button=>button.disabled=true);
let started=false;
const observer=new IntersectionObserver(async entries=>{
  if(started||!entries.some(entry=>entry.isIntersecting))return;
  started=true;observer.disconnect();
  try{
    const viewer=await createBoardScene(host);
    host.querySelector('.model-poster')?.remove();
    status.textContent='Drag to rotate · Scroll or pinch to zoom · Right-drag to pan';
    buttons.forEach(button=>{
      button.disabled=false;
      button.addEventListener('click',()=>{
        if(button.dataset.modelView)viewer.setView(button.dataset.modelView);
        else viewer.zoom(Number(button.dataset.modelZoom));
      });
    });
  }catch(error){
    host.querySelector('canvas')?.remove();
    status.textContent='The interactive view could not load. You can still inspect the board image above.';
    host.dataset.modelError='true';
    console.error('Board viewer:',error);
  }
},{rootMargin:'180px'});
observer.observe(host);
