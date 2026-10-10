import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './world/Environment.js';
import Island from './world/Island.js';
import Structures from './world/Structures.js';
import Vegetation from './world/Vegetation.js';
import Particles from './world/Particles.js';
import Waterfall from './world/Waterfall.js';
import Markers from './world/Markers.js';
import Birds from './world/Birds.js';
import Drone from './world/Drone.js';
import Character from './world/Character.js';
import BlackHole from './world/BlackHole.js';
import ModalUI from './ui/Modal.js';

// 1. Kanvas WebGL
const canvas = document.querySelector('canvas.webgl');

// 2. Kontroler Modal UI
const modal = new ModalUI();

// 3. Semesta Scene
const scene = new THREE.Scene();

// 4. Modul Lingkungan & Pencahayaan
const environment = new Environment(scene);

// 5. Lubang Hitam Kosmis di Dasar Semesta
const blackHole = new BlackHole(scene);

// 6. Kepulauan Terapung Raksasa (Archipelago)
const island = new Island(scene);

// 7. Bangunan & Vegetasi
const structures = new Structures(island.container);
const vegetation = new Vegetation(island.container);

// 8. Partikel Kosmis & Air Terjun
const particles = new Particles(island.container);
const waterfall = new Waterfall(island.container);

// 9. Kristal Penanda Titik Portofolio
const markers = new Markers(island.container);

// 10. Dinamika Udara (Burung & Drone)
const birds = new Birds(scene);
const drone = new Drone(island.container);

// 11. Karakter Pemain (Kirito dengan Sayap & Tebasan Pedang)
const character = new Character(island.container);

// 12. Dimensi Layar Responsif
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 13. Kamera Perspektif
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 200);
camera.position.set(0, 4.5, 9.0);
scene.add(camera);

// 14. Kontrol Kamera Orbit Mengikuti Karakter (Spring-Arm)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI - 0.08; // Memberikan kebebasan melihat ke bawah menuju black hole
controls.minDistance = 2.0;
controls.maxDistance = 45.0;

const initialCharPos = character.getWorldPosition();
controls.target.copy(initialCharPos).add(new THREE.Vector3(0, 0.8, 0));
let previousCharPos = initialCharPos.clone();

// 15. Renderer WebGL HD Sinematik
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x04070d);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 16. Navigasi Atas HUD 2D
const navButtons = document.querySelectorAll('.nav-item');
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;

    navButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    if (target === 'world') {
      modal.close();
    } else {
      modal.open(target);
    }
  });
});

// 17. Raycaster & Logika Klik vs Drag Kamera
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1000, -1000);
let hoveredObject = null;

let isMouseDragging = false;
let pointerDownCoord = { x: 0, y: 0 };

window.addEventListener('pointerdown', (event) => {
  isMouseDragging = false;
  pointerDownCoord.x = event.clientX;
  pointerDownCoord.y = event.clientY;
});

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  const moveDistance = Math.hypot(event.clientX - pointerDownCoord.x, event.clientY - pointerDownCoord.y);
  if (moveDistance > 5) {
    isMouseDragging = true;
  }
});

window.addEventListener('click', () => {
  if (isMouseDragging) return;

  if (hoveredObject) {
    const targetId = hoveredObject.userData.id;
    modal.open(targetId);

    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });
  } else {
    character.triggerAttack();
  }
});

// 18. Loop Animasi Render (Tick)
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animasi Singularitas Black Hole
  blackHole.update(elapsedTime, deltaTime);

  // Animasi Kepulauan & Ekosistem
  island.update(elapsedTime);
  particles.update(elapsedTime);
  waterfall.update(deltaTime);
  markers.update(elapsedTime);
  birds.update(elapsedTime);
  drone.update(elapsedTime);

  // Pergerakan Karakter (Daratan / Penerbangan & Serangan)
  character.update(deltaTime, camera, elapsedTime);

  // Kamera Mengikuti Kirito
  const currentCharPos = character.getWorldPosition();
  const deltaCharMovement = currentCharPos.clone().sub(previousCharPos);

  camera.position.add(deltaCharMovement);
  controls.target.copy(currentCharPos).add(new THREE.Vector3(0, 0.8, 0));
  previousCharPos.copy(currentCharPos);

  controls.update();

  // Raycasting Kristal
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers.interactiveObjects, false);

  if (intersects.length > 0) {
    const currentMesh = intersects[0].object;
    if (hoveredObject !== currentMesh) {
      if (hoveredObject) hoveredObject.scale.set(1, 1, 1);
      hoveredObject = currentMesh;
      hoveredObject.scale.set(1.4, 1.4, 1.4);
      document.body.style.cursor = 'pointer';
    }
  } else {
    if (hoveredObject) {
      hoveredObject.scale.set(1, 1, 1);
      hoveredObject = null;
      document.body.style.cursor = 'default';
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();