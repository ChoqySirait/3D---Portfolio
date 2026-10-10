import * as THREE from 'three';

/**
 * Kelas Character (Kirito RPG Action & Flight Controller)
 * Menampung:
 * - Navigasi relatif kamera
 * - Deteksi batas daratan kepulauan dan rintangan fisik (Kabin & Spire)
 * - Mode terbang bebas (E)
 * - Kombo serangan pedang berbobot
 */
export default class Character {
  constructor(islandContainer) {
    this.container = islandContainer;

    this.mesh = new THREE.Group();
    this.container.add(this.mesh);

    this.mesh.position.set(0, 0.38, 0);

    this.walkSpeed = 4.2;
    this.runSpeed = 8.2;
    this.flySpeed = 10.5;
    this.flyVerticalSpeed = 7.0;

    this.velocityY = 0;
    this.gravity = -22;
    this.jumpForce = 8.5;
    this.isGrounded = true;

    this.isFlying = false;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.attackDuration = 0.32;

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

    this.sword1Mat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      metalness: 0.9,
      roughness: 0.15,
    });

    this.sword2Mat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      metalness: 0.4,
    });

    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.52;
    this.mesh.add(this.torsoGroup);

    const torsoGeo = new THREE.BoxGeometry(0.38, 0.5, 0.24);
    this.torso = new THREE.Mesh(torsoGeo, coatMat);
    this.torso.castShadow = true;
    this.torsoGroup.add(this.torso);

    const coatTailGeo = new THREE.BoxGeometry(0.36, 0.36, 0.05);
    const coatTail = new THREE.Mesh(coatTailGeo, coatMat);
    coatTail.position.set(0, -0.28, -0.11);
    coatTail.rotation.x = 0.18;
    this.torsoGroup.add(coatTail);

    const headGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.38, 0);
    head.castShadow = true;
    this.torsoGroup.add(head);

    const hairGeo = new THREE.ConeGeometry(0.19, 0.22, 5);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.54, -0.02);
    hair.rotation.x = -0.2;
    this.torsoGroup.add(hair);

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

    const armGeo = new THREE.BoxGeometry(0.11, 0.42, 0.11);
    armGeo.translate(0, -0.21, 0);

    this.leftArm = new THREE.Mesh(armGeo, coatMat);
    this.leftArm.position.set(-0.27, 0.2, 0);
    this.leftArm.castShadow = true;
    this.torsoGroup.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, coatMat);
    this.rightArm.position.set(0.27, 0.2, 0);
    this.rightArm.castShadow = true;
    this.torsoGroup.add(this.rightArm);

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
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 0.15, -0.14);
    this.wingsGroup.visible = false;

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.5, 0.8);
    wingShape.lineTo(1.9, 0.2);
    wingShape.lineTo(1.1, -0.4);
    wingShape.lineTo(0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.rightWing = new THREE.Mesh(wingGeo, wingMat);
    this.wingsGroup.add(this.rightWing);

    this.leftWing = new THREE.Mesh(wingGeo, wingMat);
    this.leftWing.scale.x = -1;
    this.wingsGroup.add(this.leftWing);

    this.torsoGroup.add(this.wingsGroup);
  }

  createSlashTrails() {
    this.slashGroup = new THREE.Group();
    this.slashGroup.position.set(0, 0.65, 0.45);
    this.slashGroup.visible = false;

    const arcGeo1 = new THREE.RingGeometry(0.8, 1.4, 24, 1, 0, Math.PI * 0.85);
    this.slashMat1 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.slash1 = new THREE.Mesh(arcGeo1, this.slashMat1);
    this.slash1.rotation.set(-Math.PI * 0.2, 0, -Math.PI * 0.25);
    this.slashGroup.add(this.slash1);

    const arcGeo2 = new THREE.RingGeometry(0.85, 1.45, 24, 1, 0, Math.PI * 0.85);
    this.slashMat2 = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.slash2 = new THREE.Mesh(arcGeo2, this.slashMat2);
    this.slash2.rotation.set(Math.PI * 0.25, 0, Math.PI * 0.35);
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

      if (code === 'KeyE') this.toggleFlight();

      if (code === 'Space') {
        if (this.isFlying) {
          this.keys.flyUp = true;
        } else if (this.isGrounded) {
          this.velocityY = this.jumpForce;
          this.isGrounded = false;
        }
      }

      if (code === 'KeyC') {
        if (this.isFlying) this.keys.flyDown = true;
      }

      if (code === 'KeyF') this.triggerAttack();
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
      if (this.mesh.position.y <= 1.0) {
        this.mesh.position.y = 2.0;
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

      this.sword1Mat.emissiveIntensity = 2.0;
      this.sword2Mat.emissiveIntensity = 2.5;
      return true; // Berhasil memulai serangan
    }
    return false;
  }

  getGroundHeight(x, z) {
    if (Math.hypot(x, z) <= 6.5) return 0.38;
    if (Math.hypot(x - (-13), z) <= 4.2) return 0.18;
    if (Math.hypot(x - 13, z) <= 5.0) return 0.08;
    if (Math.hypot(x, z - (-14)) <= 4.5) return 0.78;

    if (x >= -13 && x <= -6.5 && Math.abs(z) <= 1.4) return 0.2;
    if (x >= 6.5 && x <= 13 && Math.abs(z) <= 1.4) return 0.2;
    if (z >= -14 && z <= -6.5 && Math.abs(x) <= 1.4) return 0.3;

    return -999;
  }

  // Deteksi Rintangan Bangunan Fisik (Kabin di -13,0 dan Spire di 0,-14)
  checkObstacleCollision(x, z) {
    // 1. Kabin Kaca Barat (-13, 0)
    if (Math.abs(x - (-13)) < 1.6 && Math.abs(z) < 1.4) return true;

    // 2. Menara Spire Utara (0, -14)
    if (Math.hypot(x, z - (-14)) < 0.8) return true;

    return false;
  }

  update(deltaTime, camera, elapsedTime) {
    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();

    const camRight = new THREE.Vector3();
    camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.add(camForward);
    if (this.keys.backward) moveDir.sub(camForward);
    if (this.keys.right) moveDir.add(camRight);
    if (this.keys.left) moveDir.sub(camRight);

    const isMoving = moveDir.lengthSq() > 0;
    const currentSpeed = this.isFlying
      ? (this.keys.sprint ? this.flySpeed * 1.5 : this.flySpeed)
      : (this.keys.sprint ? this.runSpeed : this.walkSpeed);

    if (isMoving) {
      moveDir.normalize();

      const nextX = this.mesh.position.x + moveDir.x * currentSpeed * deltaTime;
      const nextZ = this.mesh.position.z + moveDir.z * currentSpeed * deltaTime;

      if (!this.isFlying) {
        const targetGround = this.getGroundHeight(nextX, nextZ);
        const hitsObstacle = this.checkObstacleCollision(nextX, nextZ);

        // Hanya melangkah jika ada daratan dan tidak menabrak gedung kabin/spire
        if (targetGround !== -999 && !hitsObstacle) {
          this.mesh.position.x = nextX;
          this.mesh.position.z = nextZ;
        }
      } else {
        this.mesh.position.x = THREE.MathUtils.clamp(nextX, -28, 28);
        this.mesh.position.z = THREE.MathUtils.clamp(nextZ, -30, 20);
      }

      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetAngle, 0.25);

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

    if (this.isFlying) {
      if (this.keys.flyUp) this.mesh.position.y += this.flyVerticalSpeed * deltaTime;
      if (this.keys.flyDown) this.mesh.position.y -= this.flyVerticalSpeed * deltaTime;

      const wingFlap = Math.sin(elapsedTime * 9) * 0.45;
      this.rightWing.rotation.y = wingFlap;
      this.leftWing.rotation.y = -wingFlap;

      this.mesh.position.y = THREE.MathUtils.clamp(this.mesh.position.y, -12, 28);
      this.leftLeg.rotation.x = 0.2;
      this.rightLeg.rotation.x = 0.25;
    } else {
      const currentGround = this.getGroundHeight(this.mesh.position.x, this.mesh.position.z);
      const groundLevel = currentGround !== -999 ? currentGround : 0.38;

      this.velocityY += this.gravity * deltaTime;
      this.mesh.position.y += this.velocityY * deltaTime;

      if (this.mesh.position.y <= groundLevel) {
        this.mesh.position.y = groundLevel;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    if (this.isAttacking) {
      this.attackTimer += deltaTime;
      const progress = this.attackTimer / this.attackDuration;

      this.torsoGroup.rotation.y = Math.sin(progress * Math.PI) * 0.65;

      const slashAngle = Math.sin(progress * Math.PI) * 2.2;
      this.rightArm.rotation.x = slashAngle;
      this.rightArm.rotation.z = -slashAngle * 0.55;
      this.leftArm.rotation.x = slashAngle;
      this.leftArm.rotation.z = slashAngle * 0.55;

      this.slashGroup.rotation.y = progress * Math.PI * 0.6;
      const fade = 1 - progress;
      this.slashMat1.opacity = fade;
      this.slashMat2.opacity = fade;

      const forwardVec = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
      this.mesh.position.addScaledVector(forwardVec, deltaTime * 4.0);

      if (progress >= 1) {
        this.isAttacking = false;
        this.slashGroup.visible = false;
        this.torsoGroup.rotation.y = 0;
        this.rightArm.rotation.set(0, 0, 0);
        this.leftArm.rotation.set(0, 0, 0);
        this.sword1Mat.emissiveIntensity = 0.2;
        this.sword2Mat.emissiveIntensity = 0.8;
      }
    } else if (isMoving && !this.isFlying) {
      const armSwing = Math.sin(this.walkCycle) * 0.6;
      this.rightArm.rotation.x = -armSwing;
      this.leftArm.rotation.x = armSwing;
    } else {
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);
      this.torsoGroup.rotation.y = THREE.MathUtils.lerp(this.torsoGroup.rotation.y, 0, 0.1);
    }
  }

  getWorldPosition() {
    const target = new THREE.Vector3();
    this.mesh.getWorldPosition(target);
    return target;
  }
}