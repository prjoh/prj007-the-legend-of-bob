import * as THREE from './vendor/three/build/three.module.js'
import {Vector2, Vector3} from './vendor/three/build/three.module.js'

export const Util = {
  vector_to_string(vec) {
    if (vec instanceof Vector2 || vec instanceof THREE.Vector2)
      return `(${vec.x}, ${vec.y})`;
    if (vec instanceof Vector3 || vec instanceof THREE.Vector3)
      return `(${vec.x}, ${vec.y}, ${vec.z})`;
    else
      return "";
  }
};