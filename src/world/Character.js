import * as THREE from 'three';

/**
 * Kelas Character (Kirito Action & Flight Avatar)
 * Fitur:
 * - Mode Jalan/Lari di daratan dengan gravitasi & lompatan (WASD, Shift, Space)
 * - Mode Terbang Bebas (Free Flight Mode - Tombol E):
 *   * Membentangkan sepasang sayap cahaya neon di punggung
 *   * Gravitasi dinonaktifkan; Space = terbang naik, C = terbang turun
 *   * Bebas meluncur mengarungi kepulauan dan menjelajahi lubang hitam
 * - Serangan Tebasan Pedang Ganda dengan Sabit Cahaya Berpendar (Dual Slash Arc Trails)
 */
export default class Character {
  constructor(islandContainer) {
    this.container = islandContainer;

    this.mesh = new THREE.Group();
    this.container.add(this.mesh);

    // Titik awal di tengah alun-alun pulau utama
    this.mesh.position.set(0, 0.35, 0);

    // Konfigurasi kecepatan
    this.walkSpeed = 4.2;
    this.runSpeed = 8.0;
    this.flyHorizontalSpeed = 10.5;
    this.flyVerticalSpeed = 7.0;

    // Sistem Fisika Darat
    this.velocityY = 0;
    this.gravity = -22;
    this.jumpForce = 8.5;
    this.isGrounded = true;

    // Status Penerbangan (Flight Mode)
    this.isFlying = false;

    // Status Serangan & Efek Sabit Pedang
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.32;

    // Input Tombol
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      flyUp: false,
      flyDown: false,
    };

    this.walkCycle = 0;

    this.createModel();
    this.createWings();
    this.createSlashTrails();
    this.setupInputs();
  }

  createModel() {
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      flatShading: true,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffdfc4,
      roughness: 0.6,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.8,
      flatShading: true,
    });

    // Pedang 1 (Elucidator - Baja Mengkilap)
    this.sword1Mat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.9,
      roughness: 0.15,
    });

    // Pedang 2 (Dark Repulser - Pendaran Cyan)
    this.sword2Mat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      metalness: 0.5,
    });

    // 1. Badan
    const torsoGeo = new THREE.BoxGeometry(0.38, 0.5, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, coatMat);
    this.torso.position.y = 0.52;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    const coatTailGeo = new THREE.BoxGeometry(0.36, 0.36, 0.05);
    const coatTail = new THREE.Mesh(coatTailGeo, coatMat);
    coatTail.position.set(0, 0.24, -0.11);
    coatTail.rotation.x = 0.18;
    this.mesh.add(coatTail);

    // 2. Kepala & Rambut
    const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.9, 0);
    head.castShadow = true;
    this.mesh.add(head);

    const hairGeo = new THREE.ConeGeometry(0.19, 0.22, 5);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.06, -0.02);
    hair.rotation.x = -0.2;
    this.mesh.add(hair);

    // 3. Kaki Kiri & Kanan
    const legGeo = new THREE.BoxGeometry(0.12, 0.36, 0.12);
    legGeo.translate(0, -0.18, 0);

    this.leftLeg = new THREE.Mesh(legGeo, coatMat);
    this.leftLeg.position.set(-0.11, 0.36, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, coatMat);
    this.rightLeg.position.set(0.11, 0.36, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // 4. Lengan Kiri & Kanan
    const armGeo = new THREE.BoxGeometry(0.11, 0.42, 0.11);
    armGeo.translate(0, -0.21, 0);

    this.leftArm = new THREE.Mesh(armGeo, coatMat);
    this.leftArm.position.set(-0.27, 0.72, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, coatMat);
    this.rightArm.position.set(0.27, 0.72, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);

    // 5. Bilah Pedang di Tangan
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.88, 0.03);
    bladeGeo.translate(0, 0.4, 0);

    this.rightSword = new THREE.Mesh(bladeGeo, this.sword1Mat);
    this.rightSword.position.set(0, -0.38, 0.08);
    this.rightSword.rotation.x = Math.PI / 3;
    this.rightArm.add(this.rightSword);

    this.leftSword = new THREE.Mesh(bladeGeo, this.sword2Mat);
    this.leftSword.position.set(0, -0.38, 0.08);
    this.leftSword.rotation.x = Math.PI / 3;
    this.leftArm.add(this.leftSword);
  }

  createWings() {
    // Sayap Cahaya Ethereal (Gaya Alfheim Kirito)
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 0.65, -0.14);
    this.wingsGroup.visible = false; // Tersembunyi saat di darat

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.4, 0.8);
    wingShape.lineTo(1.8, 0.2);
    wingShape.lineTo(1.0, -0.4);
    wingShape.lineTo(0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    // Sayap Kanan
    this.rightWing = new THREE.Mesh(wingGeo, wingMat);
    this.wingsGroup.add(this.rightWing);

    // Sayap Kiri (Dibalik)
    this.leftWing = new THREE.Mesh(wingGeo, wingMat);
    this.leftWing.scale.x = -1;
    this.wingsGroup.add(this.leftWing);

    this.mesh.add(this.wingsGroup);
  }

  createSlashTrails() {
    // Efek Sabit Cahaya Tebasan (Slash Arc Ribbons)
    this.slashGroup = new THREE.Group();
    this.slashGroup.position.set(0, 0.65, 0.3);
    this.slashGroup.visible = false;

    // Sabit Cahaya Tebasan Kanan (Cyan Neon)
    const arcGeo1 = new THREE.RingGeometry(0.8, 1.35, 24, 1, 0, Math.PI * 0.8);
    this.slashMat1 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.slash1 = new THREE.Mesh(arcGeo1, this.slashMat1);
    this.slash1.rotation.set(-Math.PI * 0.2, 0, -Math.PI * 0.3);
    this.slashGroup.add(this.slash1);

    // Sabit Cahaya Tebasan Kiri (Putih-Perak)
    const arcGeo2 = new THREE.RingGeometry(0.85, 1.4, 24, 1, 0, Math.PI * 0.8);
    this.slashMat2 = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.slash2 = new THREE.Mesh(arcGeo2, this.slashMat2);
    this.slash2.rotation.set(Math.PI * 0.25, 0, Math.PI * 0.4);
    this.slashGroup.add(this.slash2);

    this.mesh.add(this.slashGroup);
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = true;

      // Kontrol Penerbangan
      if (code === 'KeyE') {
        this.toggleFlight();
      }

      if (code === 'Space') {
        if (this.isFlying) {
          this.keys.flyUp = true;
        } else if (this.isGrounded) {
          this.velocityY = this.jumpForce;
          this.isGrounded = false;
        }
      }

      if (code === 'KeyC') {
        if (this.isFlying) {
          this.keys.flyDown = true;
        }
      }

      // Tombol Serang F
      if (code === 'KeyF') {
        this.triggerAttack();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.sprint = false;
      if (code === 'Space') this.keys.flyUp = false;
      if (code === 'KeyC') this.keys.flyDown = false;
    });
  }

  toggleFlight() {
    this.isFlying = !this.isFlying;
    this.wingsGroup.visible = this.isFlying;

    if (this.isFlying) {
      this.isGrounded = false;
      this.velocityY = 0;
      // Jika toggle terbang saat berada di tanah, beri dorongan melayang awal
      if (this.mesh.position.y <= 0.6) {
        this.mesh.position.y = 1.8;
      }
    }
  }

  triggerAttack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = 0;
      this.slashGroup.visible = true;
      this.slashMat1.opacity = 0.95;
      this.slashMat2.opacity = 0.95;
    }
  }

  update(deltaTime, camera, elapsedTime) {
    // 1. Input Arah Horizontal
    const inputDir = new THREE.Vector3();
    if (this.keys.forward) inputDir.z -= 1;
    if (this.keys.backward) inputDir.z += 1;
    if (this.keys.left) inputDir.x -= 1;
    if (this.keys.right) inputDir.x += 1;

    const isMoving = inputDir.lengthSq() > 0;
    const currentSpeed = this.isFlying
      ? (this.keys.sprint ? this.flyHorizontalSpeed * 1.5 : this.flyHorizontalSpeed)
      : (this.keys.sprint ? this.runSpeed : this.walkSpeed);

    if (isMoving) {
      inputDir.normalize();

      // Selaraskan gerak maju dengan rotasi horizontal kamera
      let moveAngle = Math.atan2(inputDir.x, inputDir.z);
      if (camera) {
        const cameraYaw = Math.atan2(
          camera.position.x - this.mesh.position.x,
          camera.position.z - this.mesh.position.z
        );
        moveAngle += cameraYaw + Math.PI;
      }

      const moveX = Math.sin(moveAngle) * currentSpeed * deltaTime;
      const moveZ = Math.cos(moveAngle) * currentSpeed * deltaTime;

      this.mesh.position.x += moveX;
      this.mesh.position.z += moveZ;

      // Batasi area jelajah agar tidak hilang dari semesta
      this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -28, 28);
      this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -30, 20);

      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, moveAngle, 0.22);

      if (!this.isFlying) {
        this.walkCycle += deltaTime * (this.keys.sprint ? 19 : 12);
        const legSwing = Math.sin(this.walkCycle) * 0.72;
        this.leftLeg.rotation.x = legSwing;
        this.rightLeg.rotation.x = -legSwing;
      }
    } else if (!this.isFlying) {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
    }

    // 2. Dinamika Vertikal (Terbang vs Darat)
    if (this.isFlying) {
      // Gerakan Naik / Turun saat terbang
      if (this.keys.flyUp) {
        this.mesh.position.y += this.flyVerticalSpeed * deltaTime;
      }
      if (this.keys.flyDown) {
        this.mesh.position.y -= this.flyVerticalSpeed * deltaTime;
      }

      // Osilasi sayap mengepak bercahaya
      const wingFlap = Math.sin(elapsedTime * 9) * 0.45;
      this.rightWing.rotation.y = wingFlap;
      this.leftWing.rotation.y = -wingFlap;

      // Batas jelajah ketinggian (bisa menyelam hingga mendekati cincin black hole di -15)
      this.mesh.position.y = THREE.MathUtils.clamp(this.mesh.position.y, -14, 26);

      // Kaki rileks menggantung saat terbang
      this.leftLeg.rotation.x = 0.2;
      this.rightLeg.rotation.x = 0.25;
    } else {
      // Gravitasi daratan
      this.velocityY += this.gravity * deltaTime;
      this.mesh.position.y += this.velocityY * deltaTime;

      const groundLevel = 0.35;
      if (this.mesh.position.y <= groundLevel) {
        this.mesh.position.y = groundLevel;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // 3. Animasi Kombo Tebasan Sabit Pedang (Dual Slash FX)
    if (this.isAttacking) {
      this.attackTimer += deltaTime;
      const progress = this.attackTimer / this.attackDuration;

      // Ayunan kedua lengan
      const slashAngle = Math.sin(progress * Math.PI) * 2.2;
      this.rightArm.rotation.x = slashAngle;
      this.rightArm.rotation.z = -slashAngle * 0.55;
      this.leftArm.rotation.x = slashAngle;
      this.leftArm.rotation.z = slashAngle * 0.55;

      // Putar dan pudar sabit cahaya tebasan
      this.slashGroup.rotation.y = progress * Math.PI * 0.6;
      const fade = 1 - progress;
      this.slashMat1.opacity = fade;
      this.slashMat2.opacity = fade;

      // Dorongan langkah maju (lunge impulse) agar serangan berbobot
      const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
      this.mesh.position.addScaledVector(forwardDir, deltaTime * 3.5);

      if (progress >= 1) {
        this.isAttacking = false;
        this.slashGroup.visible = false;
        this.rightArm.rotation.set(0, 0, 0);
        this.leftArm.rotation.set(0, 0, 0);
      }
    } else if (isMoving && !this.isFlying) {
      const armSwing = Math.sin(this.walkCycle) * 0.6;
      this.rightArm.rotation.x = -armSwing;
      this.leftArm.rotation.x = armSwing;
    } else {
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
    }
  }

  getWorldPosition() {
    const target = new THREE.Vector3();
    this.mesh.getWorldPosition(target);
    return target;
  }
}