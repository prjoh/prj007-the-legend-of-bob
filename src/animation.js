import * as THREE from "./vendor/three/build/three.module.js";
import {LoadingManager} from "./loading_manager.js";
import {SpriteSheet} from "./sprite_sheet.js";


export class AnimationData {
  constructor(props) {
    this.sprite_sheet = null;
    this.sheet_animations = {};

    this._load_animations(props)
  }

  _load_animations(props) {
    // Load sprite sheet
    const img_path = `./res/animation/${props.path}/img.png`;
    this.sprite_sheet = new SpriteSheet({
      image_width: 96,
      image_height: 160,
      texture_width: 32,
      texture_height: 40,
      path: img_path,
    });

    // Load animations csv
    const file_loader = new THREE.FileLoader(LoadingManager.instance());
    const csv_path = `./res/animation/${props.path}/data.csv`;
    file_loader.load(csv_path, (data) => {
      data.split("\n").forEach((row) => {
        const data = row.split(",");

        let animation = {
          name: data[0],
          frames: data.slice(1, data.length),
          length: data.length - 1,
        };

        this.sheet_animations[animation.name] = animation;
      });
    });
  }
}