import * as THREE from 'three';

/**
 * Kelas Waterfall
 * Membangun tirai air terjun yang jatuh dari tebing kolam ke kehampaan beserta tetesan partikel.
 */
export default class Waterfall {
  constructor(islandContainer) {
    this.container = islandContainer;

    this.createStreamMesh();
    this.createFallingDroplets();
  }

  createStreamMesh() {
    // 1. Aliran Permukaan: Menghubungkan tepi kolam menuju bibir jurang
    const canalGeo = new THREE.PlaneGeometry(0.9, 1.4);
    const canalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });

    const canal = new THREE.Mesh(canalGeo, canalMat);
    canal.rotation.x = -Math.PI / 2;
    canal.rotation.z = -Math.PI * 0.28;
    canal.position.set(2.4, 0.37, 2.0);
    this.container.add(canal);

    // 2. Tirai Air Terjun Vertikal: Jatuh dari bibir pulau menuruni batuan bawah
    const fallGeo = new THREE.PlaneGeometry(0.85, 3.8);
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.75,
      roughness: 0.15,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    this.fallMesh = new THREE.Mesh(fallGeo, fallMat);
    // Posisikan tepat di bibir tebing mengarah ke bawah
    this.fallMesh.position.set(2.9, -1.6, 2.4);
    this.fallMesh.rotation.y = -Math.PI * 0.24;
    this.container.add(this.fallMesh);
  }

  createFallingDroplets() {
    // Partikel tetesan air yang jatuh terus-menerus dengan efek gravitasi
    this.dropCount = 40;
    this.dropGeometry = new THREE.BufferGeometry();
    this.dropPositions = new Float32Array(this.dropCount * 3);
    this.dropSpeeds = [];

    for (let i = 0; i < this.dropCount; i++) {
      const i3 = i * 3;

      // Sebar titik tetesan di sepanjang jalur tirai air
      this.dropPositions[i3]     = 2.8 + (Math.random() - 0.5) * 0.5;
      this.dropPositions[i3 + 1] = 0.35 - Math.random() * 3.8; // Variasi ketinggian jatuh
      this.dropPositions[i3 + 2] = 2.3 + (Math.random() - 0.5) * 0.5;

      // Kecepatan jatuh vertikal masing-masing tetesan
      this.dropSpeeds.push(2.6 + Math.random() * 2.2);
    }

    this.dropGeometry.setAttribute('position', new THREE.BufferAttribute(this.dropPositions, 3));

    const dropMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.1,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.dropPoints = new THREE.Points(this.dropGeometry, dropMat);
    this.container.add(this.dropPoints);
  }

  update(deltaTime) {
    // Perbarui posisi Y setiap tetesan air berdasarkan waktu (delta time)
    const positions = this.dropGeometry.attributes.position.array;

    for (let i = 0; i < this.dropCount; i++) {
      const i3 = i * 3;

      // Kurangi koordinat Y (efek jatuh ke bawah)
      positions[i3 + 1] -= this.dropSpeeds[i] * deltaTime;

      // Ketika tetesan mencapai dasar kehampaan, kembalikan posisinya ke bibir atas jurang
      if (positions[i3 + 1] < -3.6) {
        positions[i3 + 1] = 0.35;
        positions[i3]     = 2.8 + (Math.random() - 0.5) * 0.5;
        positions[i3 + 2] = 2.3 + (Math.random() - 0.5) * 0.5;
      }
    }

    this.dropGeometry.attributes.position.needsUpdate = true;
  }
}