import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import modelUrl from '../../models/luxury-estate-masterplan.glb?url';
import './styles.css';

const host = document.getElementById('canvas');
const status = document.getElementById('status');
const selection = document.getElementById('selection');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#8298a3');
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 4000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.65;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#edfaff', '#52715f', 2.1));
const sun = new THREE.DirectionalLight('#fff5db', 3.3);
sun.position.set(-160, 350, 240);
scene.add(sun);
const fill = new THREE.DirectionalLight('#c6e8fc', 0.6);
fill.position.set(180, 170, -120);
scene.add(fill);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 10;
controls.maxDistance = 1100;
controls.screenSpacePanning = true;

let model = null;
let savedPosition = null;
let savedTarget = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerDown = new THREE.Vector2();

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);
resize();

function fitModel() {
  if (!model) return;
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
  const distance = Math.max(200, radius * 1.35);
  camera.position.copy(center).add(new THREE.Vector3(distance, distance * 0.9, distance * 1.0));
  camera.near = Math.max(0.1, radius / 1000);
  camera.far = Math.max(2000, radius * 12);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.minDistance = Math.max(5, radius * 0.10);
  controls.maxDistance = radius * 8;
  controls.update();
  savedPosition = camera.position.clone();
  savedTarget = center.clone();
}

document.getElementById('reset').addEventListener('click', () => {
  if (savedPosition && savedTarget) {
    camera.position.copy(savedPosition);
    controls.target.copy(savedTarget);
    controls.update();
  }
});
for (const [checkboxId, prefix] of [['lots', 'LOT_'], ['amenities', 'AMEN_']]) {
  document.getElementById(checkboxId).addEventListener('change', (event) => {
    if (!model) return;
    model.traverse((object) => {
      if (object.name.startsWith(prefix)) object.visible = event.target.checked;
    });
  });
}

const loader = new GLTFLoader();
loader.load(
  modelUrl,
  (gltf) => {
    model = gltf.scene;
    scene.add(model);
    fitModel();
    let meshes = 0;
    model.traverse((object) => { if (object.isMesh) meshes++; });
    status.textContent = '3D loaded · ' + meshes.toLocaleString() + ' rendered meshes';
  },
  (progress) => {
    if (progress.total > 0) status.textContent = 'Loading spatial 3D · ' + Math.round(100 * progress.loaded / progress.total) + '%';
  },
  (error) => {
    console.error(error);
    status.textContent = 'Could not load model. Check the console and GLB path.';
  }
);

renderer.domElement.addEventListener('pointerdown', (event) => pointerDown.set(event.clientX, event.clientY));
renderer.domElement.addEventListener('pointerup', (event) => {
  if (!model || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(model, true);
  const namedPlot = hits.map(({object}) => object.name).find((name) => name.startsWith('LOT_'));
  if (namedPlot) {
    const parts = namedPlot.split('_');
    selection.textContent = 'Selected: ' + parts[1] + ' · ' + parts[2] + ' m² (conceptual dimensions)';
  } else if (hits.length) {
    selection.textContent = 'Selected asset: ' + hits[0].object.name;
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
