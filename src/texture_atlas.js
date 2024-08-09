import * as THREE from './vendor/three/build/three.module.js'
import {LoadingManager} from './loading_manager.js';


export class TextureAtlas {
  constructor(props) {
    this.image_width = props.image_width;
    this.image_height = props.image_height;
    this.texture_width = props.texture_width;
    this.texture_height = props.texture_height;
    this.columns = this.image_width / this.texture_width;
    this.rows = this.image_height / this.texture_height;
    this.data = [];

    const loader = new THREE.ImageLoader(LoadingManager.instance());
    loader.setCrossOrigin( 'anonymous' );
    loader.setPath( '' );
    loader.load( props.path, (image) => {

      for (let i = 0; i < this.rows; ++i)
      {
        this.data.push([]);
        for (let j = 0; j < this.columns; ++j)
        {
          const texture = new THREE.Texture();
          texture.image = image;
          texture.minFilter = THREE.LinearFilter;
          texture.repeat.x = 1 / this.columns;
          texture.repeat.y = 1 / this.rows;
          texture.offset.x = j * this.texture_width / this.image_width;
          texture.offset.y = (this.rows - 1 - i) * this.texture_height / this.image_height;
          texture.needsUpdate = true;

          this.data[i].push(texture);
        }
      }
    });
  }

  // create_sprite(col, row) {
  //   const texture = this.texture_atlas[row][col];
  //   const material = new THREE.SpriteMaterial({ map: texture });
  //   return new THREE.Sprite(material);
  // }

  get_texture(layout_index) {
    const [row, col] = [Math.floor(layout_index / this.columns), layout_index % this.columns];
    return this.data[row][col];
  }
}
