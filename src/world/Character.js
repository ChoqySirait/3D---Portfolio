import * as THREE from 'three';

/**
 * Kelas Character (Kirito Avatar)
 * Menghadirkan karakter 3D petualang dengan jubah hitam khas, pedang kembar di punggung,
 * animasi langkah kaki prosedural, sistem navigasi WASD, dan pembatas area tebing.
 */
export default class Character {
  constructor(islandContainer) {
    this.container = islandContainer;

    // Wadah utama avatar
    this.mesh = new THREE.Group();
    this.container.add(this.mesh);

    // Pengaturan posisi awal di jalan setapak
    this.mesh.position.set(-1.0, 0.35, 1.5);

    // State pergerakan
    this.speed = 2.8;
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    };

    // Parameter animasi langkah kaki
    this.walkCycle = 0;
    this.isMoving = false;

    this.createModel();
    this.setupInputs();
  }

  createModel() {
    // 1. Material Karakter
    const coatMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827, // Jubah hitam gelap
      roughness: 0.7,
      flatShading: true,
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdfc4, // Warna kulit alami
      roughness: 0.6,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a, // Rambut hitam tajam
      roughness: 0.8,
      flatShading: true,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Logam pedang
      metalness: 0.8,
      roughness: 0.2,
    });

    const tealMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Aksen bilah pedang kedua
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      metalness: 0.5,
    });

    // 2. Tubuh / Badan (Badan berbalut jubah)
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.48, 0.22);
    this.torso = new THREE.Mesh(torsoGeo, coatMaterial);
    this.torso.position.y = 0.52;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // Ekor jubah di bagian belakang
    const coatTailGeo = new THREE.BoxGeometry(0.34, 0.35, 0.05);
    const coatTail = new THREE.Mesh(coatTailGeo, coatMaterial);
    coatTail.position.set(0, 0.24, -0.1);
    coatTail.rotation.x = 0.15;
    this.mesh.add(coatTail);

    // 3. Kepala & Rambut
    const headGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.set(0, 0.9, 0);
    head.castShadow = true;
    this.mesh.add(head);

    // Rambut spiky low-poly
    const hairGeo = new THREE.ConeGeometry(0.18, 0.2, 5);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.set(0, 1.05, -0.02);
    hair.rotation.x = -0.2;
    this.mesh.add(hair);

    // 4. Kaki Kiri & Kaki Kanan (Pivot di pangkal paha untuk animasi jalan)
    const legGeo = new THREE.BoxGeometry(0.12, 0.35, 0.12);
    legGeo.translate(0, -0.175, 0); // Titik poros rotasi di paha

    this.leftLeg = new THREE.Mesh(legGeo, coatMaterial);
    this.leftLeg.position.set(-0.1, 0.35, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, coatMaterial);
    this.rightLeg.position.set(0.1, 0.35, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // 5. Lengan Kiri & Lengan Kanan (Pivot di pundak)
    const armGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    armGeo.translate(0, -0.2, 0);

    this.leftArm = new THREE.Mesh(armGeo, coatMaterial);
    this.leftArm.position.set(-0.25, 0.72, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, coatMaterial);
    this.rightArm.position.set(0.25, 0.72, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);

    // 6. Pedang Kembar Khas Kirito di Punggung (Disilangkan secara diagonal)
    const swordBladeGeo = new THREE.BoxGeometry(0.04, 0.75, 0.02);

    // Pedang Hitam/Perak (Elucidator style)
    const sword1 = new THREE.Mesh(swordBladeGeo, silverMaterial);
    sword1.position.set(-0.08, 0.65, -0.15);
    sword1.rotation.z = 0.55;
    sword1.castShadow = true;
    this.mesh.add(sword1);

    // Pedang Teal/Cyan (Dark Repulser style)
    const sword2 = new THREE.Mesh(swordBladeGeo, tealMaterial);
    sword2.position.set(0.08, 0.65, -0.15);
    sword2.rotation.z = -0.55;
    sword2.castShadow = true;
    this.mesh.add(sword2);
  }

  setupInputs() {
    // Mendengarkan penekanan tombol WASD dan Panah Keyboard
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
    });
  }

  update(deltaTime) {
    // Hitung vektor arah gerak dari input keyboard
    const direction = new THREE.Vector3(0, 0, 0);

    if (this.keys.forward) direction.z -= 1;
    if (this.keys.backward) direction.z += 1;
    if (this.keys.left) direction.x -= 1;
    if (this.keys.right) direction.x += 1;

    this.isMoving = direction.lengthSq() > 0;

    if (this.isMoving) {
      direction.normalize();

      // Hitung pergeseran posisi
      const moveDistance = this.speed * deltaTime;
      const nextX = this.mesh.position.x + direction.x * moveDistance;
      const nextZ = this.mesh.position.z + direction.z * moveDistance;

      // Batasi area jalan (Collision boundary agar karakter tidak jatuh dari tebing pulau)
      const distanceFromCenter = Math.sqrt(nextX * nextX + nextZ * nextZ);
      const maxIslandRadius = 3.6;

      if (distanceFromCenter < maxIslandRadius) {
        this.mesh.position.x = nextX;
        this.mesh.position.z = nextZ;
      }

      // Putar arah hadap avatar menuju arah lari secara halus
      const targetRotation = Math.atan2(direction.x, direction.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetRotation, 0.2);

      // Jalankan animasi ayunan kaki dan tangan
      this.walkCycle += deltaTime * 12;
      const swing = Math.sin(this.walkCycle) * 0.65;

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;

      // Bobbing naik-turun tubuh saat melangkah
      this.torso.position.y = 0.52 + Math.abs(Math.sin(this.walkCycle)) * 0.04;
    } else {
      // Pulihkan posisi istirahat (Idle position)
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.1);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      this.torso.position.y = 0.52;
    }
  }

  // Mendapatkan posisi koordinat dunia global karakter (untuk kamera POV/Follow)
  getWorldPosition() {
    const target = new THREE.Vector3();
    this.mesh.getWorldPosition(target);
    return target;
  }
}