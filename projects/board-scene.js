import * as THREE from '../assets/vendor/three/three.module.min.js';
import { OrbitControls } from '../assets/vendor/three/OrbitControls.js';

export async function createBoardScene(host, { interactive = true, transparent = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:transparent, preserveDrawingBuffer:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x1b2118, transparent ? 0 : 1);
  host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive 3D model of the BLE beacon board');
  renderer.domElement.setAttribute('role','img');
  renderer.domElement.tabIndex = interactive ? 0 : -1;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff,0x536047,.8));
  const light = new THREE.DirectionalLight(0xffffff,1.4); light.position.set(-40,55,90); scene.add(light);
  const fill = new THREE.DirectionalLight(0xe2eaf5,.6); fill.position.set(50,-30,30); scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff,.5); back.position.set(0,0,-80); scene.add(back);
  const paths = ['../assets/ble-beacon/board-model.json','../assets/ble-beacon/board-model.bin'];
  const responses = await Promise.all(paths.map(path=>fetch(new URL(path,import.meta.url))));
  if (responses.some(response=>!response.ok)) throw new Error('Model download failed.');
  const [data,buffer] = await Promise.all([responses[0].json(),responses[1].arrayBuffer()]);
  const group = new THREE.Group();
  const materialCache = new Map();
  function material(rgb) {
    const key = rgb.join(',');
    if (!materialCache.has(key)) {
      const neutral = Math.max(...rgb)-Math.min(...rgb)<0.06;
      materialCache.set(key,new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(...rgb),roughness:neutral?0.48:0.74,metalness:neutral&&rgb[0]>.35?.35:.05,side:THREE.DoubleSide}));
    }
    return materialCache.get(key);
  }
  for (const source of data.meshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buffer,source.position.offset,source.position.count),3));
    if(source.normal) geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(buffer,source.normal.offset,source.normal.count),3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(buffer,source.index.offset,source.index.count),1));
    if(!source.normal) geometry.computeVertexNormals();
    const materials=[material(source.color)];
    let cursor=0;
    for(const face of [...source.faces].sort((a,b)=>a.first-b.first)) {
      const start=face.first*3,end=(face.last+1)*3;
      if(start>cursor) geometry.addGroup(cursor,start-cursor,0);
      materials.push(material(face.color));geometry.addGroup(start,end-start,materials.length-1);cursor=end;
    }
    if(cursor<source.index.count) geometry.addGroup(cursor,source.index.count-cursor,0);
    const mesh=new THREE.Mesh(geometry,materials);mesh.name=source.name;group.add(mesh);
  }
  const bounds=new THREE.Box3().setFromObject(group);
  const center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  group.position.sub(center);scene.add(group);
  const extent=Math.max(size.x,size.y,size.z);
  const camera=new THREE.OrthographicCamera(-extent,extent,extent,-extent,.1,extent*20);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enabled=interactive;controls.enableDamping=false;controls.minZoom=.5;controls.maxZoom=8;
  controls.rotateSpeed=.65;controls.zoomSpeed=.8;
  const render=()=>{renderer.render(scene,camera);host.dataset.viewRevision=String(Number(host.dataset.viewRevision||0)+1);};
  controls.addEventListener('change',render);
  function resize() {
    const width=host.clientWidth,height=host.clientHeight;
    if(!width||!height)return;
    const aspect=width/height;
    const half=extent*.62*Math.max(1,1/aspect);
    camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;
    camera.updateProjectionMatrix();renderer.setSize(width,height,false);render();
  }
  function setView(view) {
    controls.target.set(0,0,0);camera.zoom=1;
    camera.up.set(0,1,0);
    const direction = view==='top' ? [0,0,3] : view==='bottom' ? [0,0,-3] : [1.5,-1.5,2.5];
    camera.position.set(...direction).multiplyScalar(extent);
    camera.lookAt(0,0,0);camera.updateProjectionMatrix();controls.update();render();
    host.dataset.preset=view;
  }
  function zoom(factor) {camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.5,8);camera.updateProjectionMatrix();render();}
  function rotate(horizontal,vertical) {
    const offset=camera.position.clone().sub(controls.target);
    const spherical=new THREE.Spherical().setFromVector3(offset);
    spherical.theta+=horizontal;spherical.phi+=vertical;spherical.makeSafe();
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();render();
  }
  renderer.domElement.addEventListener('keydown',event=>{
    const keys={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]};
    if(keys[event.key]){event.preventDefault();rotate(...keys[event.key]);}
    else if(event.key==='+'||event.key==='='){event.preventDefault();zoom(1.2);}
    else if(event.key==='-'){event.preventDefault();zoom(1/1.2);}
    else if(event.key.toLowerCase()==='r'){event.preventDefault();setView('isometric');}
  });
  const observer=new ResizeObserver(resize);observer.observe(host);
  setView('isometric');resize();host.dataset.modelReady='true';
  return {setView,zoom,rotate,render,renderer,camera,controls,dispose(){observer.disconnect();controls.dispose();renderer.dispose();group.traverse(node=>node.geometry?.dispose());materialCache.forEach(value=>value.dispose());}};
}
