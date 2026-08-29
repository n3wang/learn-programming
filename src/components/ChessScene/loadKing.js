import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import applyPrismaticLook from './applyPrismaticLook';

const MODEL_URL = '/models/chess-king.obj';

// Loads the king mesh from a real .obj model (served from /static/models)
// instead of building one out of primitives, then applies the same
// faceted/gradient treatment so it matches the site's look.
export default function loadKing() {
  return new Promise((resolve, reject) => {
    new OBJLoader().load(
      MODEL_URL,
      (obj) => {
        let mesh = null;
        obj.traverse((child) => {
          if (!mesh && child.isMesh) mesh = child;
        });
        if (!mesh) {
          reject(new Error(`No mesh found in ${MODEL_URL}`));
          return;
        }
        resolve(applyPrismaticLook(mesh.geometry));
      },
      undefined,
      reject
    );
  });
}
