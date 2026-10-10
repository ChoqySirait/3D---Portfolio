import * as THREE from 'three';

/**
 * Kelas Drone
 * Wahana penjelajah Solarpunk mandiri yang berpatroli di sekitar bibir tebing pulau
 * dilengkapi cincin antigravitasi berputar cepat dan lampu sorot daratan.
 */
export default class Drone {
  constructor(islandContainer) {
    this.container = islandContainer;
    this.droneGroup = new THREE.Group();

    this.createDroneModel();
    this.container.add(this.droneGroup);
  }

  createDroneModel() {
    // 1. Inti Bodi Drone (Bola metalik futuristik)
    const coreGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.core.castShadow = true;
    this.droneGroup.add(this.core);

    // 2. Sensor Mata Neon Cyan
    const eyeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.2,
    });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.rotation.x = Math.PI / 2;
    eye.position.set(0, 0, 0.18);
    this.droneGroup.add(eye);

    // 3. Cincin Antigravitasi Melingkari Bodi
    const ringGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      emissive: 0x4ade80,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    this.antigravRing = new THREE.Mesh(ringGeo, ringMat);
    this.antigravRing.rotation.x = Math.PI / 2;
    this.droneGroup.add(this.antigravRing);

    // 4. Lampu Sorot Bawah (Spotlight)
    this.spotLight = new THREE.SpotLight(0x38bdf8, 2.5, 6, Math.PI / 6, 0.4);
    this.spotLight.position.set(0, -0.1, 0);
    this.droneGroup.add(this.spotLight);
  }

  update(elapsedTime) {
    // Lintasan patroli mengambang di sekitar tebing dan kolam
    const radius = 3.8;
    const patrolSpeed = 0.5;
    const x = Math.cos(elapsedTime * patrolSpeed) * radius;
    const z = Math.sin(elapsedTime * patrolSpeed) * radius;
    const y = 1.6 + Math.sin(elapsedTime * 1.8) * 0.35; // Melayang naik-turun

    this.droneGroup.position.set(x, y, z);

    // Hadapkan drone ke arah lajunya
    this.droneGroup.rotation.y = -elapsedTime * patrolSpeed + Math.PI / 2;

    // Putar cincin gravitasi secara berkesinambungan
    this.antigravRing.rotation.z = elapsedTime * 4.5;
  }
}   