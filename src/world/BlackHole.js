import * as THREE from 'three';

/**
 * Kelas BlackHole (Singularitas Kosmis)
 * Menempatkan lubang hitam raksasa di dasar semesta (abyss) di bawah kepulauan terapung:
 * - Event Horizon bola hitam pekat yang menyerap seluruh cahaya
 * - Cincin Akresi (Accretion Disk) berlapis dengan gradasi cyan, ungu kosmis, dan emas
 * - Pusaran partikel gravitasi yang berputar tersedot ke titik singularitas
 */
export default class BlackHole {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Ditempatkan di kedalaman -24 di bawah kepulauan terapung
    this.group.position.set(0, -24, -2);
    this.scene.add(this.group);

    this.createEventHorizon();
    this.createAccretionDisk();
    this.createGravitationalParticles();
  }

  createEventHorizon() {
    // 1. Bola Inti Hitam Pekat (Menyerap cahaya total)
    const coreGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    // 2. Cincin Foton Tipis (Pendaran batas gravitasi terluar)
    const photonRingGeo = new THREE.TorusGeometry(4.35, 0.08, 16, 64);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    this.photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
    this.photonRing.rotation.x = Math.PI * 0.38;
    this.group.add(this.photonRing);
  }

  createAccretionDisk() {
    // Cincin Akresi Berlapis:
    // Lapisan 1: Piringan Dalam Panas (Cyan & Putih Kebiruan)
    const innerDiskGeo = new THREE.RingGeometry(4.6, 9.5, 64);
    const innerDiskMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    this.innerDisk = new THREE.Mesh(innerDiskGeo, innerDiskMat);
    this.innerDisk.rotation.x = Math.PI * 0.38;
    this.group.add(this.innerDisk);

    // Lapisan 2: Piringan Tengah Kosmis (Ungu Ultraviolet)
    const midDiskGeo = new THREE.RingGeometry(8.5, 15.0, 64);
    const midDiskMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.midDisk = new THREE.Mesh(midDiskGeo, midDiskMat);
    this.midDisk.rotation.x = Math.PI * 0.38;
    this.group.add(this.midDisk);

    // Lapisan 3: Piringan Luar Dingin (Emas / Amber Flare)
    const outerDiskGeo = new THREE.RingGeometry(13.5, 21.0, 64);
    const outerDiskMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    this.outerDisk = new THREE.Mesh(outerDiskGeo, outerDiskMat);
    this.outerDisk.rotation.x = Math.PI * 0.38;
    this.group.add(this.outerDisk);

    // Sumber Cahaya Ambien Kosmis dari Singularity ke arah bawah pulau
    this.holeLight = new THREE.PointLight(0x8b5cf6, 3.5, 35);
    this.holeLight.position.set(0, 2, 0);
    this.group.add(this.holeLight);
  }

  createGravitationalParticles() {
    // Partikel debu bintang yang tersedot spiral ke dalam lubang hitam
    this.particleCount = 180;
    this.particlesGeo = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.particleData = [];

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const dist = 5.0 + Math.random() * 16.0;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;

      this.positions[i3] = Math.cos(angle) * dist;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 1.5;
      this.positions[i3 + 2] = Math.sin(angle) * dist;

      this.particleData.push({ dist, angle, speed });
    }

    this.particlesGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.16,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particlesMesh = new THREE.Points(this.particlesGeo, particlesMat);
    this.particlesMesh.rotation.x = Math.PI * 0.38;
    this.group.add(this.particlesMesh);
  }

  update(elapsedTime, deltaTime) {
    // Putar seluruh lapisan cincin akresi pada kecepatan berbeda
    if (this.innerDisk) this.innerDisk.rotation.z = elapsedTime * 0.6;
    if (this.midDisk) this.midDisk.rotation.z = -elapsedTime * 0.35;
    if (this.outerDisk) this.outerDisk.rotation.z = elapsedTime * 0.15;
    if (this.photonRing) this.photonRing.rotation.z = elapsedTime * 0.8;

    // Perbarui pusaran partikel yang berputar mendekati singularitas
    if (this.particlesGeo) {
      const pos = this.particlesGeo.attributes.position.array;
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        const d = this.particleData[i];

        d.angle += (d.speed / d.dist) * deltaTime * 3.5;
        d.dist -= deltaTime * 0.6;

        // Jika partikel terserap ke dalam inti hitam, respawn di radius terluar
        if (d.dist < 4.3) {
          d.dist = 18.0 + Math.random() * 3.0;
        }

        pos[i3] = Math.cos(d.angle) * d.dist;
        pos[i3 + 2] = Math.sin(d.angle) * d.dist;
      }
      this.particlesGeo.attributes.position.needsUpdate = true;
    }
  }
}