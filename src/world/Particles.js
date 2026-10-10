import * as THREE from 'three';

/**
 * Kelas Particles
 * Menghasilkan spora energi bercahaya / kunang-kunang mengambang di atmosfer pulau secara prosedural.
 */
export default class Particles {
  constructor(islandContainer) {
    this.container = islandContainer;
    this.count = 65; // Jumlah partikel kunang-kunang di udara

    this.createFireflies();
  }

  createFireflies() {
    // Menggunakan BufferGeometry untuk menampung ratusan koordinat titik partikel secara efisien di GPU
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.count * 3);
    this.initialPositions = []; // Menyimpan data posisi awal dan kecepatan unik tiap partikel

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Sebar partikel secara melingkar mengelilingi pulau
      const radius = 1.0 + Math.random() * 3.6;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = 0.6 + Math.random() * 2.8; // Melayang di ketinggian 0.6 hingga 3.4
      const z = Math.sin(angle) * radius;

      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.initialPositions.push({
        x: x,
        y: y,
        z: z,
        speed: 0.6 + Math.random() * 1.4,       // Kecepatan osilasi melayang
        offset: Math.random() * Math.PI * 2,    // Fase awal acak agar gerakannya tidak serempak kaku
      });
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Material partikel Three.Points dengan efek pendaran cahaya (Additive Blending)
    this.material = new THREE.PointsMaterial({
      color: 0xfef08a,                 // Warna kuning emas hangat
      size: 0.12,                      // Ukuran pendaran titik
      sizeAttenuation: true,           // Ukuran mengecil secara perspektif jika menjauh dari kamera
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending, // Menghasilkan efek glowing saat partikel bertumpuk
      depthWrite: false,               // Mencegah artifak kotak hitam pada transparansi WebGL
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.container.add(this.points);
  }

  update(elapsedTime) {
    const positions = this.geometry.attributes.position.array;

    // Gerakkan setiap kunang-kunang menggunakan rumus trigonometri gelombang sinus dan kosinus
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const data = this.initialPositions[i];

      // Gerakan mengambang halus di ruang 3D (X, Y, Z)
      positions[i3]     = data.x + Math.sin(elapsedTime * data.speed + data.offset) * 0.18;
      positions[i3 + 1] = data.y + Math.cos(elapsedTime * data.speed + data.offset) * 0.22;
      positions[i3 + 2] = data.z + Math.sin(elapsedTime * (data.speed * 0.7) + data.offset) * 0.18;
    }

    // Mengabari GPU bahwa posisi koordinat telah berubah di frame ini
    this.geometry.attributes.position.needsUpdate = true;
  }
}