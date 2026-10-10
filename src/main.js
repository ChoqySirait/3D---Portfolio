import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1. Kanvas HTML
const canvas = document.querySelector('canvas.webgl');

// 2. Scene (Semesta 3D)
const scene = new THREE.Scene();

// 3. Objek Percobaan (Placeholder Pulau Sederhana)
const geometry = new THREE.CylinderGeometry(3, 2, 0.8, 8); // Bentuk dasar mirip pulau segi delapan
const material = new THREE.MeshStandardMaterial({ 
  color: 0x4ade80, 
  flatShading: true 
});
const baseIsland = new THREE.Mesh(geometry, material);
scene.add(baseIsland);

// 4. Pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// 5. Ukuran Layar Responsif
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Perbarui ukuran layar
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Perbarui rasio kamera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Perbarui ukuran renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 6. Kamera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(8, 6, 8);
scene.add(camera);

// 7. Kontrol Kamera (OrbitControls untuk drag & putar layar)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Gerakan rotasi terasa halus
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Mencegah kamera masuk ke bawah tanah

// 8. Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0f141c);

// 9. Loop Animasi (Tick)
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animasi mengapung halus (Bobbing effect sederhana)
  baseIsland.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
  baseIsland.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);

  // Panggil frame berikutnya
  window.requestAnimationFrame(tick);
};

tick();