import * as THREE from 'three';

/**
 * Kelas Environment
 * Bertanggung jawab mengelola tata cahaya alami dan bayangan di dunia 3D.
 */
export default class Environment {
  constructor(scene) {
    this.scene = scene;

    this.setLights();
  }

  setLights() {
    // 1. Ambient Light - Memberikan penerangan lembut menyeluruh agar area bayangan tidak hitam pekat
    this.ambientLight = new THREE.AmbientLight(0xdff9fb, 0.6);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Light - Gradasi alami antara pantulan langit biru (atas) dan permukaan tanah (bawah)
    this.hemiLight = new THREE.HemisphereLight(0x81ecec, 0x2d3436, 0.4);
    this.scene.add(this.hemiLight);

    // 3. Directional Light - Sumber cahaya utama (matahari) yang memproyeksikan bayangan realistis
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    this.sunLight.position.set(8, 14, 8);
    this.sunLight.castShadow = true;

    // Optimalisasi kualitas dan area tangkapan bayangan matahari
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 35;
    this.sunLight.shadow.camera.left = -7;
    this.sunLight.shadow.camera.right = 7;
    this.sunLight.shadow.camera.top = 7;
    this.sunLight.shadow.camera.bottom = -7;
    this.sunLight.shadow.normalBias = 0.05; // Mencegah glitch bayangan bergerigi pada permukaan datar

    this.scene.add(this.sunLight);
  }
}