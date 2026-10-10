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
import ModalUI from './ui/Modal.js';

// 1. Elemen Kanvas
const canvas = document.querySelector('canvas.webgl');

// 2. Inisialisasi UI Controller
const modal = new ModalUI();

// 3. Inisialisasi Scene
const scene = new THREE.Scene();

// 4. Modul Tata Cahaya Lingkungan
const environment = new Environment(scene);

// 5. Struktur Pulau Melayang
const island = new Island(scene);

// 6. Bangunan & Vegetasi
const structures = new Structures(island.container);
const vegetation = new Vegetation(island.container);

// 7. Efek Partikel & Air Terjun
const particles = new Particles(island.container);
const waterfall = new Waterfall(island.container);

// 8. Kristal Penanda Interaktif 3D
const markers = new Markers(island.container);

// 9. Dinamika Kehidupan Udara (Burung & Drone)
const birds = new Birds(scene);
const drone = new Drone(island.container);

// 10. Karakter Avatar Petualang (Kirito)
const character = new Character(island.container);

// 11. Dimensi Layar Responsif
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

// 12. Kamera Perspektif
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(9, 7, 9);
scene.add(camera);

// 13. Kontrol Kamera Orbit Bebas
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.minDistance = 3;
controls.maxDistance = 22;

// 14. Sistem Kamera POV / Chase Mode (Third-Person View)
let isPovMode = false; // False = Kamera Orbit Bebas, True = POV Mengikuti Kirito

// Tekan tombol 'C' pada keyboard untuk berganti mode kamera
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyC') {
    isPovMode = !isPovMode;
    controls.enabled = !isPovMode; // Matikan kontrol mouse saat mode POV aktif
  }
});

// 15. Renderer Standar HD Sinematik
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0a0f16);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 16. Interaksi Navigasi HUD 2D
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

// 17. Sistem Raycaster untuk Deteksi Klik Objek 3D
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1000, -1000);
let hoveredObject = null;

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

window.addEventListener('click', () => {
  if (hoveredObject) {
    const targetId = hoveredObject.userData.id;
    modal.open(targetId);

    navButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });
  }
});

// 18. Loop Animasi Render (Tick)
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animasi elemen lingkungan pulau
  island.update(elapsedTime);
  particles.update(elapsedTime);
  waterfall.update(deltaTime);
  markers.update(elapsedTime);
  birds.update(elapsedTime);
  drone.update(elapsedTime);

  // Update pergerakan karakter dan animasi kaki
  character.update(deltaTime);

  // Logika Kamera: Mode POV / Chase Camera vs OrbitControls
  if (isPovMode) {
    const charPos = character.getWorldPosition();

    // Kamera ditempatkan tepat di belakang dan sedikit di atas bahu Kirito
    const cameraOffset = new THREE.Vector3(0, 1.8, 3.2);
    const targetCamPos = charPos.clone().add(cameraOffset);

    // Perpindahan kamera secara mulus (Linear Interpolation)
    camera.position.lerp(targetCamPos, 0.08);
    camera.lookAt(charPos.x, charPos.y + 0.8, charPos.z);
  } else {
    controls.update();
  }

  // Kalkulasi sorot kursor mouse (Raycasting)
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers.interactiveObjects, false);

  if (intersects.length > 0) {
    const currentMesh = intersects[0].object;

    if (hoveredObject !== currentMesh) {
      if (hoveredObject) hoveredObject.scale.set(1, 1, 1);
      hoveredObject = currentMesh;
      hoveredObject.scale.set(1.35, 1.35, 1.35);
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