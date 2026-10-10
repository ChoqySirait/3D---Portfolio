import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './world/Environment.js';
import Island from './world/Island.js';
import Structures from './world/Structures.js';
import Vegetation from './world/Vegetation.js';
import Particles from './world/Particles.js';
import Waterfall from './world/Waterfall.js';

// 1. Inisialisasi Elemen Kanvas
const canvas = document.querySelector('canvas.webgl');

// 2. Inisialisasi Scene
const scene = new THREE.Scene();

// 3. Muat Tata Cahaya Lingkungan
const environment = new Environment(scene);

// 4. Muat Komponen Pulau Melayang
const island = new Island(scene);

// 5. Muat Bangunan & Vegetasi (Menempel pada wadah pulau)
const structures = new Structures(island.container);
const vegetation = new Vegetation(island.container);

// 6. Muat Efek Partikel Atmosfer & Air Terjun (Menempel pada wadah pulau)
const particles = new Particles(island.container);
const waterfall = new Waterfall(island.container);

// 7. Dimensi Layar Responsif
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

// 8. Kamera Perspektif
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(9, 7, 9);
scene.add(camera);

// 9. Kontrol Orbit Interaktif
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 4;
controls.maxDistance = 22;

// 10. Renderer WebGL dengan Shadow Map
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0f141c);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 11. Loop Animasi Render (Tick)
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animasi mengapung pulau
  island.update(elapsedTime);

  // Animasi partikel kunang-kunang di udara
  particles.update(elapsedTime);

  // Animasi tetesan air terjun jatuh ke bawah
  waterfall.update(deltaTime);

  // Perbarui kontrol kamera
  controls.update();

  // Render ke layar
  renderer.render(scene, camera);

  // Panggil frame berikutnya
  window.requestAnimationFrame(tick);
};

tick();