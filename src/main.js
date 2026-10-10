import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Environment from './world/Environment.js';
import Island from './world/Island.js';

// 1. Inisialisasi Elemen Kanvas
const canvas = document.querySelector('canvas.webgl');

// 2. Inisialisasi Scene
const scene = new THREE.Scene();

// 3. Muat Modul Tata Cahaya & Lingkungan
const environment = new Environment(scene);

// 4. Muat Modul Pulau Melayang
const island = new Island(scene);

// 5. Pengaturan Dimensi Layar Responsif
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update ukuran layar
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update rasio kamera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update ukuran canvas renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 6. Kamera Perspektif
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(10, 8, 10); // Sudut pandang isometrik dari atas samping
scene.add(camera);

// 7. Kontrol Kamera (OrbitControls)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Gerakan rotasi halus/berbobot
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Mencegah kamera menukik ke bawah garis horizontal dasar
controls.minDistance = 5;  // Batas zoom terdekat
controls.maxDistance = 25; // Batas zoom terjauh

// 8. Renderer WebGL dengan Shadow Map Aktif
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0f141c); // Warna latar belakang gelap kosmis
renderer.shadowMap.enabled = true; // Aktifkan kalkulasi bayangan
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Jenis bayangan bertepi halus

// 9. Loop Animasi Render (Tick)
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animasi mengapung dinamis pada pulau
  island.update(elapsedTime);

  // Perbarui kalkulasi kontrol kamera
  controls.update();

  // Render frame ke layar
  renderer.render(scene, camera);

  // Minta browser menjalankan tick pada frame berikutnya (60-120 FPS)
  window.requestAnimationFrame(tick);
};

tick();