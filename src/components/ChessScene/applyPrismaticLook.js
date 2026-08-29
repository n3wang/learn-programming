import * as THREE from 'three';

// Blue hue used for every face; only lightness varies, and only at random
// (not tied to the piece's shape or height).
const HUE = 0.62; // blue
const SATURATION = 0.65;
const MIN_LIGHTNESS = 0.35;
const MAX_LIGHTNESS = 0.75;

// Takes any BufferGeometry, flat-shades it, and colors each face a random
// shade of blue — used for both procedural and loaded (OBJ) chess pieces.
export default function applyPrismaticLook(geometry) {
  let geo = geometry.index ? geometry.toNonIndexed() : geometry;
  geo.computeVertexNormals();
  geo.center();

  const position = geo.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const tmp = new THREE.Color();

  for (let face = 0; face < position.count / 3; face++) {
    tmp.setHSL(HUE, SATURATION, MIN_LIGHTNESS + Math.random() * (MAX_LIGHTNESS - MIN_LIGHTNESS));

    for (let v = 0; v < 3; v++) {
      const idx = (face * 3 + v) * 3;
      colors[idx] = tmp.r;
      colors[idx + 1] = tmp.g;
      colors[idx + 2] = tmp.b;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    metalness: 0.2,
    roughness: 0.25,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0,
  });

  const mesh = new THREE.Mesh(geo, material);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 20),
    new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.35})
  );

  const group = new THREE.Group();
  group.add(mesh, edges);

  geo.computeBoundingSphere();
  const boundingRadius = geo.boundingSphere.radius;

  return {group, material, boundingRadius};
}
