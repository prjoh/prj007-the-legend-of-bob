import {Scene as ThreeScene} from './vendor/three/build/three.module';


let scene = null;

export const Scene = {
  instance() {
    if (scene === null)
      scene = new ThreeScene();
    return scene;
  },
}
