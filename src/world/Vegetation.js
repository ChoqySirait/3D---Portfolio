import * as THREE from 'three';

/**
 * Kelas Vegetation
 * Menyusun pohon rindang low-poly bertingkat dan semak belukar di sekitar pulau.
 */
export default class Vegetation {
  constructor(islandContainer) {
    this.container = islandContainer;

    this.createMaterials();
    this.createTrees();
    this.createBushes();
  }

  createMaterials() {
    // Material Batang Pohon
    this.trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.9,
      flatShading: true,
    });

    // Material Dedaunan Hijau Tua & Hijau Muda
    this.foliageDark = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.8,
      flatShading: true,
    });

    this.foliageLight = new THREE.MeshStandardMaterial({
      color: 0x4caf50,
      roughness: 0.8,
      flatShading: true,
    });
  }

  buildTree(x, z, scale = 1, isBright = false) {
    const treeGroup = new THREE.Group();

    // 1. Batang Kayu Silinder
    const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.4 * scale, 6);
    const trunk = new THREE.Mesh(trunkGeo, this.trunkMaterial);
    trunk.position.y = (1.4 * scale) / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 2. Dedaunan Bertingkat Menggunakan Kerucut Low-Poly
    const foliageMat = isBright ? this.foliageLight : this.foliageDark;

    const layerBottomGeo = new THREE.ConeGeometry(1.1 * scale, 1.2 * scale, 7);
    const layerBottom = new THREE.Mesh(layerBottomGeo, foliageMat);
    layerBottom.position.y = 1.3 * scale;
    layerBottom.castShadow = true;
    treeGroup.add(layerBottom);

    const layerTopGeo = new THREE.ConeGeometry(0.8 * scale, 1.0 * scale, 7);
    const layerTop = new THREE.Mesh(layerTopGeo, foliageMat);
    layerTop.position.y = 1.9 * scale;
    layerTop.castShadow = true;
    treeGroup.add(layerTop);

    // Posisikan pohon di atas rumput
    treeGroup.position.set(x, 0.35, z);
    this.container.add(treeGroup);
  }

  createTrees() {
    // Sebaran pohon di beberapa sudut pulau
    const treeData = [
      { x: 1.2,  z: -2.0, scale: 1.1,  bright: false },
      { x: -2.8, z: 0.8,  scale: 0.9,  bright: true  },
      { x: 2.6,  z: -0.6, scale: 1.0,  bright: true  },
      { x: -2.2, z: -2.3, scale: 0.85, bright: false },
    ];

    treeData.forEach((t) => this.buildTree(t.x, t.z, t.scale, t.bright));
  }

  createBushes() {
    // Semak-semak bundar low-poly (Icosahedron) di dekat perairan dan kabin
    const bushGeo = new THREE.IcosahedronGeometry(0.35, 1);
    const bushPositions = [
      { x: 1.0, z: 1.2 },
      { x: 2.7, z: 1.8 },
      { x: 1.6, z: 2.6 },
      { x: -0.1, z: -0.9 },
    ];

    bushPositions.forEach((pos) => {
      const bush = new THREE.Mesh(bushGeo, this.foliageLight);
      bush.position.set(pos.x, 0.5, pos.z);
      bush.scale.set(1, 0.8, 1);
      bush.castShadow = true;
      bush.receiveShadow = true;
      this.container.add(bush);
    });
  }
}