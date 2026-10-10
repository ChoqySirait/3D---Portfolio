import * as THREE from 'three';

/**
 * Kelas Structures
 * Membangun kabin kaca berteknologi modern, panel surya, dan lentera energi di atas pulau.
 */
export default class Structures {
  constructor(islandContainer) {
    // Menempelkan struktur langsung ke grup pulau agar bergerak selaras saat melayang
    this.container = islandContainer;

    this.createCabin();
    this.createSolarPanels();
    this.createLanterns();
  }

  createCabin() {
    // 1. Dek Kayu Fondasi Kabin
    const deckGeo = new THREE.BoxGeometry(2.6, 0.2, 2.2);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x8d5b4c,
      roughness: 0.8,
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-1.2, 0.45, -0.8);
    deck.receiveShadow = true;
    deck.castShadow = true;
    this.container.add(deck);

    // 2. Dinding Ruangan Kaca Modern (Transparan & Reflektif)
    const glassGeo = new THREE.BoxGeometry(2.2, 1.4, 1.8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xcbeef3,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.1,
    });
    this.cabinMesh = new THREE.Mesh(glassGeo, glassMat);
    this.cabinMesh.position.set(-1.2, 1.25, -0.8);
    this.cabinMesh.castShadow = true;
    this.container.add(this.cabinMesh);

    // 3. Rangka Kusen Hitam Kabin
    const frameGeo = new THREE.BoxGeometry(2.25, 1.45, 1.85);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2d3436,
      wireframe: false,
      roughness: 0.6,
    });
    // Atap datar modern di atas kaca
    const roofGeo = new THREE.BoxGeometry(2.4, 0.15, 2.0);
    const roof = new THREE.Mesh(roofGeo, frameMat);
    roof.position.set(-1.2, 2.0, -0.8);
    roof.castShadow = true;
    this.container.add(roof);

    // 4. Meja Kerja & Monitor Mini di Dalam Kabin
    const deskGeo = new THREE.BoxGeometry(0.9, 0.1, 0.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(-1.2, 0.9, -0.8);
    this.container.add(desk);

    // Layar monitor bercahaya lembut (Emissive Screen)
    const monitorGeo = new THREE.BoxGeometry(0.5, 0.35, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.6,
    });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(-1.2, 1.15, -0.9);
    this.container.add(monitor);

    // Cahaya interior hangat dari dalam ruangan
    const indoorLight = new THREE.PointLight(0xffedd5, 1.2, 4);
    indoorLight.position.set(-1.2, 1.5, -0.8);
    this.container.add(indoorLight);
  }

  createSolarPanels() {
    // Modul Panel Surya Solarpunk (Miring menyerap sinar matahari)
    const panelFrameGeo = new THREE.BoxGeometry(1.0, 0.06, 0.7);
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,      // Warna biru dongker fotovoltaik
      metalness: 0.8,
      roughness: 0.2,
    });

    const panelPositions = [
      { x: -1.7, y: 2.15, z: -0.8 },
      { x: -0.7, y: 2.15, z: -0.8 },
    ];

    panelPositions.forEach((pos) => {
      const panel = new THREE.Mesh(panelFrameGeo, cellMat);
      panel.position.set(pos.x, pos.y, pos.z);
      panel.rotation.x = -Math.PI * 0.12; // Miring menghadap matahari
      panel.castShadow = true;
      this.container.add(panel);
    });
  }

  createLanterns() {
    // Lentera penunjuk jalan di pinggir jalan setapak
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

    const bulbGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
    });

    const lanternCoords = [
      { x: -0.7, z: 1.8 },
      { x: 0.4,  z: 0.5 },
    ];

    lanternCoords.forEach((coord) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(coord.x, 0.65, coord.z);
      pole.castShadow = true;
      this.container.add(pole);

      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(coord.x, 0.95, coord.z);
      this.container.add(bulb);

      // Titik pendar cahaya lentera
      const light = new THREE.PointLight(0xfef08a, 0.8, 2.5);
      light.position.set(coord.x, 1.0, coord.z);
      this.container.add(light);
    });
  }
}