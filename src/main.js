import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './world/Environment.js';
import Island from './world/Island.js';
import Structures from './world/Structures.js';
import Vegetation from './world/Vegetation.js';

// 1. Inisialisasi Elemen Kanvas
const canvas = document.querySelector('canvas.webgl');

// 2. Inisialisasi Scene
const scene = new THREE.Scene();

// 3. Muat Tata Cahaya Lingkungan
const environment = new Environment(scene);

// 4. Muat Komponen Pulau Melayang
const island = new Island(scene);

// 5. Muat Bangunan Kabin & Vegetasi (Ditempelkan ke wadah pulau agar ikut mengapung)
const structures = new Structures(island.container);
const vegetation = new Vegetation(island.container);

// 6. Dimensi Layar Responsif
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

// 7. Kamera Perspektif (Sudut pandang isometrik yang seimbang)
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(9, 7, 9);
scene.add(camera);

// 8. Kontrol Orbit Interaktif
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 4;
controls.maxDistance = 22;

// 9. Renderer WebGL dengan Shadow Map Halus
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0f141c);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 10. Loop Animasi Render (Tick)
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animasi pulau melayang naik-turun (membawa serta bangunan dan pohon)
  island.update(elapsedTime);

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();