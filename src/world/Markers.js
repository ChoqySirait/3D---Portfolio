import * as THREE from 'three';

/**
 * Kelas Markers
 * Menciptakan kristal/pin interaktif melayang yang menandai zona penting di pulau:
 * 1. Kabin -> About Me
 * 2. Kolam -> Projects
 * 3. Lentera -> Contact
 */
export default class Markers {
  constructor(islandContainer) {
    this.container = islandContainer;

    // Array untuk menampung objek yang bisa dideteksi oleh Raycaster
    this.interactiveObjects = [];

    this.createMarkers();
  }

  createBeacon(x, y, z, id, labelText, hexColor) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // 1. Kristal Inti Penanda (Bentuk Oktahedron Berlian 3D)
    const crystalGeo = new THREE.OctahedronGeometry(0.24, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: hexColor,
      emissive: hexColor,
      emissiveIntensity: 0.7, // Memancarkan pendaran warna sendiri
      metalness: 0.1,
      roughness: 0.2,
      wireframe: false,
    });

    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.castShadow = true;
    group.add(crystal);

    // 2. Cincin Pulsasi Energi di Bawah Kristal
    const ringGeo = new THREE.RingGeometry(0.18, 0.26, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.35;
    group.add(ring);

    // Simpan metadata ke dalam objek kristal untuk dikenali Raycaster saat diklik
    crystal.userData = {
      id: id,
      label: labelText,
      parentGroup: group,
      defaultScale: 1,
      hoverScale: 1.35,
    };

    // Daftarkan kristal ke daftar target deteksi klik
    this.interactiveObjects.push(crystal);

    this.container.add(group);

    return { group, crystal, ring };
  }

  createMarkers() {
    this.markersList = [
      // Pin 1: Kabin Kaca (About Me)
      this.createBeacon(-1.2, 2.5, -0.8, 'about', 'Tentang Saya', 0x38bdf8),

      // Pin 2: Oasis Kolam (Featured Projects)
      this.createBeacon(1.8, 1.2, 1.4, 'projects', 'Karya & Proyek', 0x4ade80),

      // Pin 3: Jalur Setapak / Lentera (Contact)
      this.createBeacon(0.4, 1.5, 0.5, 'contact', 'Hubungi Saya', 0xfbbf24),
    ];
  }

  update(elapsedTime) {
    // Animasi putaran dan osilasi naik-turun pada seluruh kristal penanda
    this.markersList.forEach((item, index) => {
      // Putar kristal secara kontinu
      item.crystal.rotation.y = elapsedTime * (1.2 + index * 0.2);
      item.crystal.rotation.x = Math.sin(elapsedTime * 1.5) * 0.2;

      // Gerakan melayang halus
      item.group.position.y += Math.sin(elapsedTime * 2.5 + index) * 0.002;
    });
  }
}