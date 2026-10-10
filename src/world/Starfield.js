import * as THREE from 'three';

/**
 * Kelas Starfield
 * Membangun kubah semesta berisi ribuan bintang kosmis dengan variasi warna
 * (cyan, ungu, putih, emas) dan ukuran dinamis di kedalaman angkasa.
 */
export default class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 1400;

    this.createStars();
  }

  createStars() {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.starCount * 3);
    const colors = new Float32Array(this.starCount * 3);

    // Palet warna bintang kosmis
    const colorPalette = [
      new THREE.Color(0xffffff), // Putih murni
      new THREE.Color(0x38bdf8), // Biru langit / Cyan
      new THREE.Color(0xc084fc), // Ungu nebula
      new THREE.Color(0xfef08a), // Emas muda
    ];

    for (let i = 0; i < this.starCount; i++) {
      const i3 = i * 3;

      // Sebar bintang di kubah bola raksasa dengan radius 50 hingga 110 meter
      const radius = 50 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Pilih warna acak dari palet
      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3]     = chosenColor.r;
      colors[i3 + 1] = chosenColor.g;
      colors[i3 + 2] = chosenColor.b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material partikel bintang berkilau
    this.material = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starsMesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.starsMesh);
  }

  update(elapsedTime) {
    // Rotasi pelan semesta bintang di latar belakang
    if (this.starsMesh) {
      this.starsMesh.rotation.y = elapsedTime * 0.015;
      this.starsMesh.rotation.x = elapsedTime * 0.008;
    }
  }
}