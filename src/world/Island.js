import * as THREE from 'three';

/**
 * Kelas Island
 * Merakit komponen geometris dasar dari Pulau Melayang Solarpunk secara prosedural.
 */
export default class Island {
  constructor(scene) {
    this.scene = scene;

    // Menggunakan THREE.Group agar seluruh bagian pulau dapat digerakkan secara serempak
    this.container = new THREE.Group();
    this.scene.add(this.container);

    this.createTerrain();
    this.createWater();
    this.createPathway();
  }

  createTerrain() {
    // 1. Lapisan Permukaan Rumput (Silinder bersegi 9 bergaya Low-Poly)
    const grassGeometry = new THREE.CylinderGeometry(4.2, 4.0, 0.7, 9);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x48bb78,      // Warna hijau segar alami
      flatShading: true,     // Memberi efek bayangan facet polygonal yang estetik
      roughness: 0.8,
    });

    this.grassMesh = new THREE.Mesh(grassGeometry, grassMaterial);
    this.grassMesh.position.y = 0;
    this.grassMesh.receiveShadow = true; // Siap menerima jatuhnya bayangan dari pohon/properti nanti
    this.container.add(this.grassMesh);

    // 2. Lapisan Batuan Bawah Pulau (Kerucut terbalik yang meruncing ke arah kehampaan)
    const rockGeometry = new THREE.ConeGeometry(4.0, 4.2, 9);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d312a,      // Warna cokelat keabuan tanah berbatu
      flatShading: true,
      roughness: 0.95,
    });

    this.rockBaseMesh = new THREE.Mesh(rockGeometry, rockMaterial);
    // Putar 180 derajat (Math.PI) agar ujung runcing kerucut menghadap ke bawah
    this.rockBaseMesh.rotation.x = Math.PI;
    this.rockBaseMesh.position.y = -2.45;
    this.rockBaseMesh.castShadow = true;
    this.rockBaseMesh.receiveShadow = true;
    this.container.add(this.rockBaseMesh);
  }

  createWater() {
    // Kolam air alami kecil di tepi pulau (Oasis Solarpunk)
    const waterGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 16);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,       // Sangat licin memantulkan cahaya
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,        // Efek tembus pandang kejernihan air
    });

    this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    // Tempatkan tepat di atas lapisan rumput
    this.waterMesh.position.set(1.8, 0.36, 1.4);
    this.waterMesh.receiveShadow = true;
    this.container.add(this.waterMesh);
  }

  createPathway() {
    // Batu loncatan setapak untuk memandu mata pengunjung menuju area eksplorasi
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      flatShading: true,
      roughness: 0.8,
    });

    // Koordinat penataan titik-titik batu di permukaan rumput
    const steppingStones = [
      { x: -1.5, z: 2.2, radius: 0.35 },
      { x: -1.0, z: 1.5, radius: 0.32 },
      { x: -0.4, z: 0.9, radius: 0.40 },
      { x: 0.1,  z: 0.2, radius: 0.34 },
      { x: 0.6,  z: -0.5, radius: 0.38 },
    ];

    steppingStones.forEach((data) => {
      const stoneGeo = new THREE.CylinderGeometry(data.radius, data.radius, 0.08, 6);
      const stoneMesh = new THREE.Mesh(stoneGeo, stoneMaterial);
      stoneMesh.position.set(data.x, 0.36, data.z);
      stoneMesh.rotation.y = Math.random() * Math.PI; // Rotasi acak agar tampak natural
      stoneMesh.receiveShadow = true;
      this.container.add(stoneMesh);
    });
  }

  update(elapsedTime) {
    // Gerakan melayang (Bobbing Effect) naik dan turun secara lembut menggunakan fungsi sinus
    this.container.position.y = Math.sin(elapsedTime * 1.2) * 0.12;

    // Rotasi perlahan memutar pulau
    this.container.rotation.y = elapsedTime * 0.04;
  }
}   