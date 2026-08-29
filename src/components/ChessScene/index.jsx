import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import Link from '@docusaurus/Link';
import loadKing from './loadKing';
import lessons from './lessons';
import {getCodeLevel, getRandomExercise} from './progress';
import styles from './styles.module.css';

const ROTATION_THRESHOLD = Math.PI / 2; // ~90° of turning triggers a new suggestion
const AUTO_ROTATE_SPEED = 0.28; // radians/sec while idle
const DRAG_SENSITIVITY = 0.009;
const PIECE_SCALE = 0.4;

function pickLesson(excludeIndex) {
  if (lessons.length <= 1) return {lesson: lessons[0], index: 0};
  let index = excludeIndex;
  while (index === excludeIndex) {
    index = Math.floor(Math.random() * lessons.length);
  }
  return {lesson: lessons[index], index};
}

export default function ChessScene() {
  const mountRef = useRef(null);
  const [lesson, setLesson] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [codeLevel, setCodeLevel] = useState(0);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    let cancelled = false;
    getCodeLevel()
      .then((level) => {
        if (!cancelled) setCodeLevel(level);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let disposed = false;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // The model loads asynchronously, so add a stable, empty group up front
    // — pointer handlers can rotate it right away, and the loaded mesh just
    // gets appended into it once it arrives.
    const king = new THREE.Group();
    king.scale.setScalar(PIECE_SCALE);
    scene.add(king);
    let kingMaterial = null;

    loadKing()
      .then(({group, material, boundingRadius}) => {
        if (disposed) return;
        king.add(group);
        kingMaterial = material;

        // Distance is derived from the piece's *unscaled* radius so
        // shrinking PIECE_SCALE actually leaves more empty space, instead
        // of the camera creeping in to compensate.
        const distance = (boundingRadius / Math.sin((camera.fov * Math.PI) / 360)) * 1.9;
        camera.position.set(0, 0.15, distance);
        camera.lookAt(0, 0, 0);
      })
      .catch((error) => {
        console.error('Failed to load chess king model', error);
      });

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xbcbcff, 0.6);
    rimLight.position.set(-4, 2, -3);
    scene.add(rimLight);

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    resize();
    window.addEventListener('resize', resize);

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationAccumulator = 0;

    function triggerSuggestion() {
      setHasSpun(true);
      // Prefer a real exercise from the student's own history (pending
      // ones outrank already-passed ones) — only fall back to a random
      // lesson link when they have no tracked history yet.
      getRandomExercise()
        .then((exercise) => {
          if (disposed) return;
          if (exercise) {
            setLesson(exercise);
            return;
          }
          const {lesson: next, index} = pickLesson(lastIndexRef.current);
          lastIndexRef.current = index;
          setLesson(next);
        })
        .catch(() => {
          if (disposed) return;
          const {lesson: next, index} = pickLesson(lastIndexRef.current);
          lastIndexRef.current = index;
          setLesson(next);
        });
    }

    function onPointerDown(event) {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      king.rotation.y += dx * DRAG_SENSITIVITY;
      king.rotation.x = THREE.MathUtils.clamp(
        king.rotation.x + dy * DRAG_SENSITIVITY,
        -0.6,
        0.6
      );
      rotationAccumulator += Math.abs(dx) * DRAG_SENSITIVITY + Math.abs(dy) * DRAG_SENSITIVITY;
      if (rotationAccumulator >= ROTATION_THRESHOLD) {
        rotationAccumulator = 0;
        triggerSuggestion();
      }
    }

    function onPointerUp(event) {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    }

    const dom = renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointerleave', onPointerUp);

    const clock = new THREE.Clock();
    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (!dragging) {
        king.rotation.y += AUTO_ROTATE_SPEED * delta;
        rotationAccumulator += AUTO_ROTATE_SPEED * delta;
        if (rotationAccumulator >= ROTATION_THRESHOLD) {
          rotationAccumulator = 0;
          triggerSuggestion();
        }
      }

      // Gentle "blink" — a slow glow pulse.
      const pulse = Math.sin(elapsed * 1.1) * 0.5 + 0.5;
      if (kingMaterial) kingMaterial.emissiveIntensity = pulse * 0.12;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointerleave', onPointerUp);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      renderer.dispose();
      container.removeChild(dom);
    };
  }, []);

  return (
    <div className={styles.stage}>
      {codeLevel > 0 && <div className={styles.level}>code lv{codeLevel}</div>}
      <div ref={mountRef} className={styles.canvasHost} />
      <div className={styles.footer}>
        
        {lesson && (
          <Link to={lesson.to} className={styles.suggestion}>
            <span className={styles.suggestionSubject}>{lesson.subject}</span>
            <span className={styles.suggestionTitle}>{lesson.title}</span>
          </Link>
        )}
      </div>
      <a
        className={styles.credit}
        href="https://www.thingiverse.com/thing:1237746"
        target="_blank"
        rel="noopener noreferrer">
        King model by alongruss (CC BY-ND)
      </a>
    </div>
  );
}
