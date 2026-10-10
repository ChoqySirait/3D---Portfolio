import * as THREE from 'three';

/**
 * Kelas Enemy (Cyber Training Drone / Glitch Core)
 * Ditempatkan di Pulau Utara (-14 Z) dekat Spire:
 * - Bar HP melayang di atas kepala (100 HP, berkurang 20-25 per tebasan)
 * - Teks angka damage melayang saat tertebas
 * - Getaran benturan dan kilatan merah saat terkena serangan
 * - Efek ledakan partikel digital dan sistem respawn otomatis
 */
export default class Enemy {
  constructor(islandContainer) {
    this.container = islandContainer;

    this.group = new THREE.Group();
    // Ditempatkan di Pulau Utara (Skills Spire)
    this.spawnPosition = new THREE.Vector3(2.4, 1.4, -14);
    this.group.position.copy(this.spawnPosition);
    this.container.add(this.group);

    // Konfigurasi Status Musuh
    this.maxHp = 100;
    this.currentHp = 100;
    this.isDead = false;
    this.respawnTimer = 0;
    this.respawnDuration = 3.5;

    // Status Efek Hit
    this.hitFlashTimer = 0;
    this.floatingTexts = [];

    this.createModel();
    this.createHealthBar();
  }

  createModel() {
    // 1. Inti Kristal Musuh (Oktahedron Cyberpunk)
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2,
      wireframe: false,
    });
    this.core = new THREE.Mesh(coreGeo, this.coreMat);
    this.core.castShadow = true;
    this.group.add(this.core);

    // 2. Cincin Orbital Perisai Berputar
    const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 8, 24);
    this.ringMat = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      emissive: 0xef4444,
      emissiveIntensity: 0.6,
    });
    this.orbitRing = new THREE.Mesh(ringGeo, this.ringMat);
    this.group.add(this.orbitRing);

    // 3. Partikel Serpihan Hancur (Disiapkan untuk saat kalah)
    this.debrisCount = 25;
    this.debrisGeo = new THREE.BufferGeometry();
    this.debrisPositions = new Float32Array(this.debrisCount * 3);
    this.debrisVelocities = [];

    for (let i = 0; i < this.debrisCount; i++) {
      this.debrisPositions[i * 3] = 0;
      this.debrisPositions[i * 3 + 1] = 0;
      this.debrisPositions[i * 3 + 2] = 0;

      this.debrisVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 5.0,
          Math.random() * 4.0 + 1.0,
          (Math.random() - 0.5) * 5.0
        )
      );
    }
    this.debrisGeo.setAttribute('position', new THREE.BufferAttribute(this.debrisPositions, 3));
    this.debrisMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.18,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.debrisMesh = new THREE.Points(this.debrisGeo, this.debrisMat);
    this.group.add(this.debrisMesh);
  }

  createHealthBar() {
    // Membuat Bar HP 3D menggunakan Canvas Texture dinamis
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 32;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: this.texture,
      transparent: true,
    });

    this.hpSprite = new THREE.Sprite(spriteMat);
    this.hpSprite.position.set(0, 1.1, 0);
    this.hpSprite.scale.set(1.6, 0.22, 1);
    this.group.add(this.hpSprite);

    this.renderHpCanvas();
  }

  renderHpCanvas() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Latar Belakang Bar HP Gelap
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect ? ctx.roundRect(0, 0, w, h, 8) : ctx.rect(0, 0, w, h);
    ctx.fill();

    // Garis Tepi
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bar Darah Merah (Rasio HP Tersisa)
    const hpRatio = Math.max(0, this.currentHp / this.maxHp);
    const fillWidth = Math.max(0, (w - 8) * hpRatio);

    ctx.fillStyle = hpRatio > 0.3 ? '#ef4444' : '#dc2626';
    if (fillWidth > 0) {
      ctx.fillRect(4, 4, fillWidth, h - 8);
    }

    // Teks Label & Angka
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DUMMY: ${Math.round(this.currentHp)}/${this.maxHp}`, w / 2, 22);

    this.texture.needsUpdate = true;
  }

  takeDamage(amount) {
    if (this.isDead) return false;

    this.currentHp -= amount;
    this.hitFlashTimer = 0.12; // Memicu kilatan putih terang saat terkena tebasan

    // Efek dorongan benturan (Knockback getar kecil)
    this.group.position.y += 0.12;

    this.spawnFloatingDamage(amount);

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.die();
    }

    this.renderHpCanvas();
    return true;
  }

  spawnFloatingDamage(damage) {
    // Membuat pop-up angka kerusakan melayang menggunakan Sprite 3D
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 128;
    textCanvas.height = 64;
    const tctx = textCanvas.getContext('2d');

    tctx.font = 'bold 36px sans-serif';
    tctx.fillStyle = '#fef08a';
    tctx.strokeStyle = '#000000';
    tctx.lineWidth = 4;
    tctx.textAlign = 'center';
    tctx.strokeText(`-${damage}`, 64, 44);
    tctx.fillText(`-${damage}`, 64, 44);

    const spriteMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(textCanvas),
      transparent: true,
    });
    const textSprite = new THREE.Sprite(spriteMat);
    textSprite.position.set(
      this.group.position.x + (Math.random() - 0.5) * 0.4,
      this.group.position.y + 0.8,
      this.group.position.z + (Math.random() - 0.5) * 0.4
    );
    textSprite.scale.set(1.0, 0.5, 1);
    this.container.add(textSprite);

    this.floatingTexts.push({ sprite: textSprite, life: 0.8 });
  }

  die() {
    this.isDead = true;
    this.respawnTimer = this.respawnDuration;
    this.core.visible = false;
    this.orbitRing.visible = false;
    this.hpSprite.visible = false;

    // Picu ledakan partikel serpihan
    this.debrisMat.opacity = 1.0;
    const pos = this.debrisPositions;
    for (let i = 0; i < this.debrisCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    this.debrisGeo.attributes.position.needsUpdate = true;
  }

  respawn() {
    this.isDead = false;
    this.currentHp = this.maxHp;
    this.core.visible = true;
    this.orbitRing.visible = true;
    this.hpSprite.visible = true;
    this.debrisMat.opacity = 0;
    this.group.position.copy(this.spawnPosition);
    this.renderHpCanvas();
  }

  update(deltaTime, elapsedTime) {
    // 1. Update Efek Teks Damage Melayang
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const item = this.floatingTexts[i];
      item.life -= deltaTime;
      item.sprite.position.y += deltaTime * 1.5;
      item.sprite.material.opacity = item.life / 0.8;

      if (item.life <= 0) {
        this.container.remove(item.sprite);
        this.floatingTexts.splice(i, 1);
      }
    }

    // 2. Kondisi Kematian & Respawn
    if (this.isDead) {
      this.respawnTimer -= deltaTime;

      // Animasikan sebaran serpihan ledakan
      if (this.debrisMat.opacity > 0) {
        this.debrisMat.opacity = Math.max(0, this.debrisMat.opacity - deltaTime * 0.8);
        const pos = this.debrisPositions;
        for (let i = 0; i < this.debrisCount; i++) {
          const v = this.debrisVelocities[i];
          pos[i * 3] += v.x * deltaTime;
          pos[i * 3 + 1] += v.y * deltaTime;
          pos[i * 3 + 2] += v.z * deltaTime;
          v.y -= 9.8 * deltaTime; // Efek gravitasi pada serpihan
        }
        this.debrisGeo.attributes.position.needsUpdate = true;
      }

      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // 3. Animasi Mengapung Halus & Rotasi
    this.group.position.y = this.spawnPosition.y + Math.sin(elapsedTime * 2.2) * 0.15;
    this.core.rotation.y = elapsedTime * 1.6;
    this.core.rotation.x = Math.sin(elapsedTime * 1.2) * 0.25;

    this.orbitRing.rotation.x = Math.PI * 0.4 + Math.sin(elapsedTime * 2.0) * 0.2;
    this.orbitRing.rotation.y = elapsedTime * 2.5;

    // 4. Efek Kilatan Hit Flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= deltaTime;
      this.coreMat.emissive.setHex(0xffffff);
      this.coreMat.emissiveIntensity = 2.5;
    } else {
      this.coreMat.emissive.setHex(0xdc2626);
      this.coreMat.emissiveIntensity = 0.8;
    }
  }

  getWorldPosition() {
    const target = new THREE.Vector3();
    this.group.getWorldPosition(target);
    return target;
  }
}