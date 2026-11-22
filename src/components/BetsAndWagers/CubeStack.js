import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import styles from './styles.module.css';

/** One colour per layer, bottom up, so layers are easy to count. */
const LAYERS = [0xffd166, 0x8fd694, 0x7cc6fe, 0xf4a6c6, 0xc3a6ff, 0xffa07a];

/**
 * A stack of unit cubes in 3D ("count the cubes"). `cubes.heights[z][x]` is
 * the column height at (x, z). Drag to turn it (and tilt it to look from
 * above); with `spin`, it turns slowly on its own whenever nobody is dragging.
 */
export default function CubeStack({cubes, height = 320, spin = true}) {
  const mountRef = useRef(null);
  const key = cubes ? JSON.stringify(cubes.heights) : '';

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !cubes) return undefined;
    const heights = cubes.heights;
    const rows = heights.length;
    const cols = Math.max(...heights.map((r) => r.length));
    const tallest = Math.max(1, ...heights.flat());

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(3, 6, 4);
    scene.add(sun);

    // The stack, centred on the origin with its floor at y = 0.
    const stack = new THREE.Group();
    const box = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(box);
    const line = new THREE.LineBasicMaterial({color: 0x141414});
    const mats = LAYERS.map((c) => new THREE.MeshLambertMaterial({color: c}));
    heights.forEach((row, z) =>
      row.forEach((h, x) => {
        for (let y = 0; y < h; y++) {
          const cube = new THREE.Mesh(box, mats[y % mats.length]);
          cube.position.set(x - (cols - 1) / 2, y + 0.5, z - (rows - 1) / 2);
          cube.add(new THREE.LineSegments(edges, line));
          stack.add(cube);
        }
      }),
    );
    // A floor grid under the whole board, so empty squares read as empty.
    const floor = new THREE.GridHelper(Math.max(cols, rows), Math.max(cols, rows), 0x9a9a9a, 0xc8c8c8);
    floor.position.y = 0.001;
    if (cols !== rows) floor.scale.set(cols / Math.max(cols, rows), 1, rows / Math.max(cols, rows));
    stack.add(floor);
    const pivot = new THREE.Group();
    stack.position.y = -tallest / 2;
    pivot.add(stack);
    pivot.rotation.x = 0.5;
    pivot.rotation.y = -0.7;
    scene.add(pivot);

    const reach = Math.hypot(cols, rows, tallest);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, reach * 1.9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const dom = renderer.domElement;
    dom.className = styles.cubeCanvas;
    dom.style.touchAction = 'none';
    container.appendChild(dom);

    const resize = () => {
      const width = container.clientWidth || 320;
      const h = container.clientHeight || height;
      camera.aspect = width / h;
      camera.updateProjectionMatrix();
      renderer.setSize(width, h, false);
    };
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
      dom.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      pivot.rotation.y += (e.clientX - lastX) * 0.012;
      // Tilt from side-on to straight down (top view), never upside down.
      pivot.rotation.x = THREE.MathUtils.clamp(pivot.rotation.x + (e.clientY - lastY) * 0.012, 0, Math.PI / 2);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
    dom.addEventListener('pointercancel', onUp);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (spin && !dragging) pivot.rotation.y += 0.004;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointercancel', onUp);
      box.dispose();
      edges.dispose();
      line.dispose();
      mats.forEach((m) => m.dispose());
      floor.geometry.dispose();
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
    // Rebuild only when the stack itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, height, spin]);

  if (!cubes) return null;
  return <div ref={mountRef} className={styles.cubeStack} style={{height}} />;
}
