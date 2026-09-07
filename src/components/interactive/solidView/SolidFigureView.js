import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './solidView.module.css';

const FACE = 0x90caf9;
const EDGE = 0x1565c0;
const VERTEX = 0xc62828;

function circleLoop(radius, y) {
  const pts = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: EDGE }));
}

function vertexDots(points, size) {
  const geo = new THREE.SphereGeometry(size, 10, 8);
  const mat = new THREE.MeshBasicMaterial({ color: VERTEX });
  const group = new THREE.Group();
  points.forEach((p) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(p);
    group.add(m);
  });
  return group;
}

function boxCorners(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  const pts = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) pts.push(new THREE.Vector3(sx * x, sy * y, sz * z));
    }
  }
  return pts;
}

/** Unique positions on the built mesh. Cylinder/Cone put a hub at the face center — drop those. */
function meshCorners(geometry, { keepApex = false } = {}) {
  const pos = geometry.getAttribute('position');
  const seen = new Map();
  for (let i = 0; i < pos.count; i++) {
    const p = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const key = `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  const pts = [...seen.values()];
  const onAxis = pts.filter((p) => Math.hypot(p.x, p.z) < 1e-3);
  const ring = pts.filter((p) => Math.hypot(p.x, p.z) >= 1e-3);
  if (!keepApex) return ring;
  if (!onAxis.length) return ring;
  const apex = onAxis.reduce((best, p) => (p.y > best.y ? p : best));
  return [apex, ...ring];
}

function tetraCorners(radius) {
  const s = radius / Math.sqrt(3);
  return [
    new THREE.Vector3(s, s, s),
    new THREE.Vector3(-s, -s, s),
    new THREE.Vector3(-s, s, -s),
    new THREE.Vector3(s, -s, -s),
  ];
}

function buildSolid(id, highlight) {
  const group = new THREE.Group();
  const faceMat = new THREE.MeshBasicMaterial({
    color: highlight === 'faces' ? 0xffcc80 : FACE,
    transparent: true,
    opacity: highlight === 'faces' ? 0.95 : 0.72,
    side: THREE.DoubleSide,
  });

  let mesh = null;
  let verts = [];
  let extraEdges = [];

  if (id === 'cuboid') {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1, 0.9), faceMat);
    verts = boxCorners(1.7, 1, 0.9);
  } else if (id === 'cube') {
    mesh = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, 1.25), faceMat);
    verts = boxCorners(1.25, 1.25, 1.25);
  } else if (id === 'cylinder') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.45, 40), faceMat);
    extraEdges = [circleLoop(0.62, 0.725), circleLoop(0.62, -0.725)];
  } else if (id === 'cone') {
    mesh = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.5, 40), faceMat);
    extraEdges = [circleLoop(0.72, -0.75)];
    verts = [new THREE.Vector3(0, 0.75, 0)];
  } else if (id === 'pyramid') {
    mesh = new THREE.Mesh(new THREE.ConeGeometry(0.78, 1.45, 4), faceMat);
    mesh.geometry.rotateY(Math.PI / 4);
    // Apex + 4 base corners from the mesh. Do not include the base center.
    verts = meshCorners(mesh.geometry, { keepApex: true });
  } else if (id === 'prism') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 1.2, 3), faceMat);
    // Match CylinderGeometry angles (sin/cos), and drop the two face-center hubs.
    verts = meshCorners(mesh.geometry);
  } else if (id === 'triPyramid') {
    mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.95), faceMat);
    verts = tetraCorners(0.95);
  } else {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(0.78, 32, 24), faceMat);
  }

  group.add(mesh);
  if (highlight === 'edges') mesh.visible = false;

  if (id !== 'sphere' && id !== 'cylinder' && id !== 'cone') {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 12),
      new THREE.LineBasicMaterial({
        color: highlight === 'edges' ? 0xe65100 : EDGE,
        transparent: true,
        opacity: highlight === 'edges' ? 1 : 0.85,
      }),
    );
    edges.rotation.copy(mesh.rotation);
    group.add(edges);
    if (!verts.length) {
      const pos = mesh.geometry.getAttribute('position');
      const seen = new Set();
      for (let i = 0; i < pos.count; i++) {
        const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        verts.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
      }
    }
  }

  extraEdges.forEach((line) => {
    line.material.color.set(highlight === 'edges' ? 0xe65100 : EDGE);
    group.add(line);
  });

  if (verts.length) {
    const dots = vertexDots(verts, highlight === 'vertices' ? 0.07 : 0.045);
    group.add(dots);
    dots.visible = highlight === 'vertices' || highlight === 'all';
    if (highlight !== 'vertices' && highlight !== 'all') dots.visible = false;
  }

  if (highlight === 'edges') {
    extraEdges.forEach((line) => {
      line.material.linewidth = 2;
    });
  }

  return group;
}

export default function SolidFigureView({ solidId = 'cuboid', highlight = 'none', height = 220, caption }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(2.2, 1.5, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    renderer.domElement.className = styles.canvas;
    renderer.domElement.style.height = `${height}px`;

    const solid = buildSolid(solidId, highlight);
    scene.add(solid);

    function resize() {
      const width = container.clientWidth || 320;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e) => {
      if (!dragging) return;
      solid.rotation.y += (e.clientX - lastX) * 0.01;
      solid.rotation.x = THREE.MathUtils.clamp(solid.rotation.x + (e.clientY - lastY) * 0.01, -0.8, 0.8);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointerleave', onUp);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!dragging) solid.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointerleave', onUp);
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
  }, [solidId, highlight, height]);

  return (
    <div className={styles.frame} style={{ height }}>
      <div ref={mountRef} style={{ width: '100%', height }} />
      {caption ? <div className={styles.caption}>{caption}</div> : null}
    </div>
  );
}
