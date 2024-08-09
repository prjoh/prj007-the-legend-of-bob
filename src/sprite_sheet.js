import * as THREE from "./vendor/three/build/three.module.js";
import {LoadingManager} from "./loading_manager.js";


export class SpriteSheet {
  constructor(props) {
    this.image_width = props.image_width;
    this.image_height = props.image_height;
    this.texture_width = props.texture_width;
    this.texture_height = props.texture_height;
    this.columns = this.image_width / this.texture_width;
    this.rows = this.image_height / this.texture_height;

    const loader = new THREE.TextureLoader(LoadingManager.instance());
    this.map = loader.load(props.path);
    this.map.minFilter = THREE.LinearFilter;
    this.map.repeat.x = 1 / this.columns;
    this.map.repeat.y = 1 / this.rows;
    this.map.offset.y = -0.0025;  // TODO
    this.map.needsUpdate = true;
  }

  get_offset(sheet_id) {
    const [row, col] = [Math.floor(sheet_id / this.columns), sheet_id % this.columns];

    const x = col * this.texture_width / this.image_width;
    const y = (this.rows - 1 - row) * this.texture_height / this.image_height;

    return [x, y];
  }
}