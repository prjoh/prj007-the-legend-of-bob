import * as THREE from '../vendor/three/build/three.module.js'
import {LoadingManager} from "../loading_manager.js";
import {Layers} from "../layers.js";
import {TextureAtlas} from "../texture_atlas.js";
import {Graphic} from "./graphic.js";
import {StaticCollider} from "./collider.js";
import {Component} from "./component.js";


const TILE_SIZE = 32;  // TODO

export class LevelData {
  constructor(props) {
    this.background = null;
    this.width = null;
    this.height = null;
    this.tile_data = [];

    // Load the background image
    const loader = new THREE.TextureLoader(LoadingManager.instance());
    loader.load(props.background, (map) => {
      const material = new THREE.SpriteMaterial({ map: map });
      this.background = new THREE.Sprite(material);
      this.width = map.image.width / TILE_SIZE;
      this.height = map.image.height / TILE_SIZE;
      this.background.position.x = this.width * 0.5;
      this.background.position.y = this.height * 0.5;
      this.background.position.z = Layers.GROUND;
      this.background.scale.set(this.width, this.height,1);
    });

    // Load tile data
    props.tile_data.forEach((td) => {
      this._load_tile_data(td, this.tile_data);
    });
  }

  _load_tile_data(props, container) {
    const tile_data = {
      tileset: null,
      layout: [],
      layer: props.layer,
    };

    // Load tile layout
    this._load_csv(props.path_prefix + '.csv', tile_data.layout)

    // Load tileset
    tile_data.tileset = new TextureAtlas({
      image_width: props.width,
      image_height: props.height,
      texture_width: TILE_SIZE,
      texture_height: TILE_SIZE,
      path: props.path_prefix + '.png',
    });

    // Load collision data
    if (props.has_collision)
    {
      tile_data['collision'] = [];
      tile_data['collider_size'] = props.collider_size;
      // Load collision data
      this._load_csv(props.path_prefix + '_col.csv', tile_data.collision);
    }

    container.push(tile_data);
  }

  _load_csv(path, container) {
    const file_loader = new THREE.FileLoader(LoadingManager.instance());
    file_loader.load(path, (data) => {
      data.split("\n").forEach((row) => {
        if (row.length > 0)
          container.push(row.split(","));
      });
    });
  }
}

export class LevelComponent extends Component {
  constructor(props) {
    super(props);
    this.entity_manager = props.entity_manager;
    this.scene = props.scene;
    this.level_data = props.level_data;
    this.y_sort = props.y_sort;
    this.width = null;
    this.height = null;
    this.colliders = [];
  }

  init_component() {
    this.width = this.level_data.width;
    this.height = this.level_data.height;

    this.scene.add(this.level_data.background);

    const tile_data = this.level_data.tile_data;
    for (let i = 0; i < tile_data.length; ++i) {
      const td = tile_data[i];
      const layout = td.layout;
      const tileset = td.tileset;
      const collision = 'collision' in td ? td.collision : null;

      for (let row = 0; row < layout.length; ++row) {
        for (let col = 0; col < layout[row].length; ++col) {
          const ndx = layout[row][col];
          if (ndx == -1) {
            continue;
          }

          const map = tileset.get_texture(ndx);
          let is_collider = false;
          if (collision != null)
            is_collider = collision[row][col] == 0;

          const tile = this.entity_manager.create(`tile-${col}-${row}`);
          tile.add_component(new Graphic({
            map: map,
            size: new THREE.Vector2(1.0, 1.0),
            scene: this.scene,
            position: new THREE.Vector2(col, row),
            layer: td.layer,
            animated: false,
          }));

          if (is_collider)
          {
            tile.add_component(new StaticCollider({
              position: new THREE.Vector2(col, row).addScalar(0.5),
              collider_size: td.collider_size,
            }));
            this.colliders.push(tile.get_component('StaticCollider'));
          }

          if (td.layer == Layers.PLAYER)
            this.y_sort.add_graphic(tile.get_component('Graphic'));
        }
      }
    }
  }
}
