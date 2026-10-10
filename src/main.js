import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
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
import Enemy from './world/Enemy.js';
import BlackHole from './world/BlackHole.js';
import Starfield from './world/Starfield.js';
import AudioManager from './utils/Audio.js';
import ModalUI from './ui/Modal.js';

// 1. Kanvas WebGL & Manajer Sistem
const canvas = document.querySelector('canvas.webgl');
const modal = new ModalUI();
const audio = new AudioManager();

// 2. Semesta Scene & Kabut Kosmis
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x04070d, 0.012);

// 3. Modul Tata Cahaya Alami
const environment = new Environment(scene);

// 4. Gugusan Bintang Kosmis & Lubang Hitam
const starfield = new Starfield(scene);
const blackHole = new BlackHole(scene);

// 5. Kepulauan Terapung Raksasa (Archipelago)
const island = new Island(scene);

// 6. Fasilitas Bangunan & Vegetasi
const structures = new Structures(island.container);
const vegetation = new Vegetation(island.container);

// 7. Partikel Kosmis & Air Terjun
const particles = new Particles(island.container);
const waterfall = new Waterfall(island.container);

// 8. Kristal Penanda Titik Portofolio
const markers = new Markers(island.container);

// 9. Dinamika Udara (Burung & Drone)
const birds = new Birds(scene);
const drone = new Drone(island.container);

// 10. Karakter Pemain (Kirito) & Target Musuh (Dummy)
const character = new Character(island.container);
const enemy = new Enemy(island.container);

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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 250);
camera.position.set(0, 4.2, 8.8);
scene.add(camera);

// 13. Kontrol Kamera Orbit Spring-Arm
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minPolarAngle = 0.15;
controls.maxPolarAngle = Math.PI * 0.58;
controls.minDistance = 2.2;
controls.maxDistance = 45.0;

const initialCharPos = character.getWorldPosition();
controls.target.set(initialCharPos.x, initialCharPos.y + 0.8, initialCharPos.z);

// 14. Renderer WebGL HD Sinematik
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

// 15. Elemen Antarmuka HUD
const statusLocation = document.getElementById('status-location');
const flightBadge = document.getElementById('flight-badge');
const proximityPrompt = document.getElementById('proximity-prompt');
const proximityTitle = document.getElementById('proximity-title');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
let currentNearbyBeacon = null;

// Tombol Audio Mute
audioToggleBtn.addEventListener('click', () => {
  const isMuted = audio.toggleMute();
  audioToggleBtn.textContent = isMuted ? '🔇' : '🔊';
});

// Koordinat Target Pendaratan untuk Fast-Travel
const islandWaypoints = {
  world:    { x: 0,   y: 0.38, z: 0,   camY: 4.5, camDist: 9.0,  name: 'Central Plaza' },
  about:    { x: -10, y: 0.2,  z: 0,   camY: 4.0, camDist: 8.5,  name: 'Cyber Sanctuary (West)' },
  skills:   { x: 0,   y: 0.8,  z: -11, camY: 4.8, camDist: 9.5,  name: 'Skills Spire (North)' },
  projects: { x: 10,  y: 0.1,  z: 0,   camY: 4.2, camDist: 8.8,  name: 'Oasis Forge (East)' },
  contact:  { x: 0,   y: 0.38, z: 3.2, camY: 3.8, camDist: 7.5,  name: 'Central Beacon' },
};

// 16. Fast-Travel Parabolik (Melengkung di Angkasa Tanpa Tembus Objek)
let isCinematicFlying = false;

function travelToIsland(targetKey) {
  const waypoint = islandWaypoints[targetKey];
  if (!waypoint) return;

  isCinematicFlying = true;
  modal.close(); // Pastikan modal tertutup agar pemandangan penerbangan terlihat jelas

  const startPos = character.mesh.position.clone();
  const peakHeight = Math.max(startPos.y, waypoint.y) + 3.8; // Titik lengkung di udara

  // Lintasan melengkung naik-turun karakter menggunakan objek interpolasi GSAP
  const pathProgress = { p: 0 };
  gsap.to(pathProgress, {
    p: 1,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      const p = pathProgress.p;
      // Kurva Bezier Kuadratik
      character.mesh.position.x = (1 - p) * startPos.x + p * waypoint.x;
      character.mesh.position.z = (1 - p) * startPos.z + p * waypoint.z;
      character.mesh.position.y = (1 - p) * (1 - p) * startPos.y + 2 * (1 - p) * p * peakHeight + p * p * waypoint.y;
    },
    onComplete: () => {
      isCinematicFlying = false;
    },
  });

  // Kamera meluncur mengawal karakter ke sudut pandang ideal
  gsap.to(controls.target, {
    x: waypoint.x,
    y: waypoint.y + 0.8,
    z: waypoint.z,
    duration: 1.8,
    ease: 'power2.inOut',
  });

  gsap.to(camera.position, {
    x: waypoint.x,
    y: waypoint.y + waypoint.camY,
    z: waypoint.z + waypoint.camDist,
    duration: 2.0,
    ease: 'power2.inOut',
  });
}

// Navigasi Atas HUD
const navButtons = document.querySelectorAll('.nav-item');
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;

    navButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    if (target === 'resume') {
      modal.open('resume');
    } else {
      travelToIsland(target);
    }
  });
});

// 17. Pengendali Aksi Serangan & Deteksi Hit ke Musuh
function executeAttackAction() {
  const attacked = character.triggerAttack();
  if (attacked) {
    audio.playSlash();

    // Periksa apakah Kirito berada dalam jangkauan tebasan musuh (radius 2.6 meter)
    const charPos = character.getWorldPosition();
    const enemyPos = enemy.getWorldPosition();
    const distToEnemy = charPos.distanceTo(enemyPos);

    if (distToEnemy <= 2.6 && !enemy.isDead) {
      // Hit berhasil mengenai Cyber Dummy!
      const damage = Math.floor(20 + Math.random() * 6); // 20 hingga 25 damage
      enemy.takeDamage(damage);
      audio.playHit();
    }
  }
}

// 18. Raycaster & Logika Klik vs Drag
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1000, -1000);
let hoveredObject = null;
let isMouseDragging = false;
let pointerDownCoord = { x: 0, y: 0 };

window.addEventListener('pointerdown', (event) => {
  // Abaikan input klik jika menyentuh tombol navigasi atau modal
  if (event.target.closest('.hud-header') || event.target.closest('.modal-container') || event.target.closest('.mobile-controls')) {
    return;
  }
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

window.addEventListener('click', (event) => {
  if (isMouseDragging) return;
  if (event.target.closest('.hud-header') || event.target.closest('.modal-container') || event.target.closest('.mobile-controls')) {
    return;
  }

  if (hoveredObject) {
    const targetId = hoveredObject.userData.id;
    travelToIsland(targetId);
  } else if (currentNearbyBeacon) {
    modal.open(currentNearbyBeacon.id);
  } else {
    executeAttackAction();
  }
});

// 19. Event Binding On-Screen Touch Controls Ponsel
const bindTouchBtn = (id, onStart, onEnd) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onStart();
  });
  el.addEventListener('touchend', (e) => {
    e.preventDefault();
    onEnd();
  });
};

bindTouchBtn('btn-up', () => (character.keys.forward = true), () => (character.keys.forward = false));
bindTouchBtn('btn-down', () => (character.keys.backward = true), () => (character.keys.backward = false));
bindTouchBtn('btn-left', () => (character.keys.left = true), () => (character.keys.left = false));
bindTouchBtn('btn-right', () => (character.keys.right = true), () => (character.keys.right = false));

const btnAttack = document.getElementById('btn-attack');
if (btnAttack) {
  btnAttack.addEventListener('touchstart', (e) => {
    e.preventDefault();
    executeAttackAction();
  });
}

const btnJump = document.getElementById('btn-jump');
if (btnJump) {
  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (character.isFlying) {
      character.keys.flyUp = true;
    } else if (character.isGrounded) {
      character.velocityY = character.jumpForce;
      character.isGrounded = false;
    }
  });
  btnJump.addEventListener('touchend', (e) => {
    e.preventDefault();
    character.keys.flyUp = false;
  });
}

const btnFly = document.getElementById('btn-fly');
if (btnFly) {
  btnFly.addEventListener('touchstart', (e) => {
    e.preventDefault();
    character.toggleFlight();
  });
}

// 20. Loop Animasi Render (Tick)
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animasi Semesta & Musuh
  starfield.update(elapsedTime);
  blackHole.update(elapsedTime, deltaTime);
  island.update(elapsedTime);
  particles.update(elapsedTime);
  waterfall.update(deltaTime);
  markers.update(elapsedTime);
  birds.update(elapsedTime);
  drone.update(elapsedTime);
  enemy.update(deltaTime, elapsedTime);

  // Pergerakan Karakter
  if (!isCinematicFlying) {
    character.update(deltaTime, camera, elapsedTime);

    const currentCharPos = character.getWorldPosition();
    const targetChest = new THREE.Vector3(currentCharPos.x, currentCharPos.y + 0.8, currentCharPos.z);
    const deltaTarget = targetChest.clone().sub(controls.target);

    camera.position.add(deltaTarget);
    controls.target.copy(targetChest);
  }

  controls.update();

  // Update Status HUD & Proximity Detection
  flightBadge.textContent = character.isFlying ? 'Flying (Alfheim)' : 'Walking Mode';
  flightBadge.style.color = character.isFlying ? '#38bdf8' : '#4ade80';

  const charPos = character.getWorldPosition();

  // Lokasi Terdekat
  let nearestZone = 'Cosmic Void';
  let minZoneDist = Infinity;
  Object.entries(islandWaypoints).forEach(([key, wp]) => {
    const dist = Math.hypot(charPos.x - wp.x, charPos.z - wp.z);
    if (dist < minZoneDist) {
      minZoneDist = dist;
      nearestZone = wp.name;
    }
  });
  statusLocation.textContent = nearestZone;

  // Deteksi Jarak ke Kristal Penanda (Radius 3.6m)
  let foundNearby = null;
  markers.markersList.forEach((beacon) => {
    const beaconWorldPos = new THREE.Vector3();
    beacon.group.getWorldPosition(beaconWorldPos);
    const dist = charPos.distanceTo(beaconWorldPos);

    if (dist < 3.6) {
      foundNearby = beacon.crystal.userData;
    }
  });

  if (foundNearby) {
    currentNearbyBeacon = foundNearby;
    proximityTitle.textContent = `Inspect ${foundNearby.label}`;
    proximityPrompt.classList.remove('hidden');
  } else {
    currentNearbyBeacon = null;
    proximityPrompt.classList.add('hidden');
  }

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