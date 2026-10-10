import * as THREE from 'three';

/**
 * Kelas Birds
 * Menciptakan kawanan burung camar low-poly yang terbang mengitari pulau
 * dengan kepakan sayap dinamis menggunakan kalkulasi trigonometri.
 */
export default class Birds {
  constructor(scene) {
    this.scene = scene;
    this.birdsList = [];
    this.birdCount = 5;

    this.createFlock();
  }

  createSingleBird(colorHex = 0xffffff) {
    const birdGroup = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      flatShading: true,
      roughness: 0.5,
    });

    // 1. Badan Burung (Kerucut ramping memanjang horizontal)
    const bodyGeo = new THREE.ConeGeometry(0.08, 0.45, 4);
    const body = new THREE.Mesh(bodyGeo, mat);
    body.rotation.x = Math.PI / 2; // Rebahkan menghadap arah terbang
    birdGroup.add(body);

    // 2. Sayap Kiri (Prisma segitiga tipis dengan pivot di pangkal sayap)
    const wingGeo = new THREE.BoxGeometry(0.35, 0.02, 0.14);
    wingGeo.translate(-0.175, 0, 0); // Geser titik poros ke pangkal tubuh
    const leftWing = new THREE.Mesh(wingGeo, mat);
    leftWing.position.set(-0.04, 0.02, 0);
    birdGroup.add(leftWing);

    // 3. Sayap Kanan
    const rightWingGeo = new THREE.BoxGeometry(0.35, 0.02, 0.14);
    rightWingGeo.translate(0.175, 0, 0);
    const rightWing = new THREE.Mesh(rightWingGeo, mat);
    rightWing.position.set(0.04, 0.02, 0);
    birdGroup.add(rightWing);

    return { birdGroup, leftWing, rightWing };
  }

  createFlock() {
    for (let i = 0; i < this.birdCount; i++) {
      const birdData = this.createSingleBird(0xf8fafc);

      // Parameter lintasan terbang unik tiap burung
      const radius = 5.2 + i * 0.7; // Jari-jari lingkaran terbang
      const altitude = 4.2 + (i % 3) * 0.6; // Ketinggian terbang di atas pulau
      const speed = 0.6 + i * 0.12; // Kecepatan tempuh orbit
      const offset = (i * Math.PI * 2) / this.birdCount; // Jarak renggang antaraburung
      const flapSpeed = 8 + i * 1.5; // Kecepatan kepakan sayap

      this.scene.add(birdData.birdGroup);

      this.birdsList.push({
        mesh: birdData.birdGroup,
        leftWing: birdData.leftWing,
        rightWing: birdData.rightWing,
        radius,
        altitude,
        speed,
        offset,
        flapSpeed,
      });
    }
  }

  update(elapsedTime) {
    this.birdsList.forEach((bird) => {
      const angle = elapsedTime * bird.speed + bird.offset;

      // Hitung posisi orbit elips di sekeliling pulau
      const x = Math.cos(angle) * bird.radius;
      const z = Math.sin(angle) * bird.radius;
      const y = bird.altitude + Math.sin(elapsedTime * 2 + bird.offset) * 0.25;

      bird.mesh.position.set(x, y, z);

      // Arahkan kepala burung sejajar dengan arah terbang (vektor tangensial)
      const targetAngle = -angle;
      bird.mesh.rotation.y = targetAngle;

      // Kepakkan sayap kiri dan kanan naik-turun secara simetris
      const wingRotation = Math.sin(elapsedTime * bird.flapSpeed) * 0.55;
      bird.leftWing.rotation.z = wingRotation;
      bird.rightWing.rotation.z = -wingRotation;
    });
  }
}