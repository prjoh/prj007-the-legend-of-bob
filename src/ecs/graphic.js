import {Component} from "./component.js";
import {Sprite, SpriteMaterial, TextureLoader, Vector2} from "../vendor/three/build/three.module.js";
import {LoadingManager} from "../loading_manager.js";


export class Graphic extends Component {
  constructor(props) {
    super();
    this.scene = props.scene;
    this.layer = props.layer;
    this.sprite = null;
    this.animated = props.animated;
    this.loaded = false;

    if (this.animated)
    {
      props['map'] = null;
      this._init(props);
    }
    else if ('path' in props)
    {
      const loader = new TextureLoader(LoadingManager.instance());
      loader.load(props.path, (map) => {
        props['map'] = map;
        this._init(props);
      });
    }
    else
    {
      this._init(props);
    }
  }

  init_component() {
    if (this.animated)
    {
      this.scene.remove(this.sprite);
      const map = this.get_component('CharacterController')._animation_fsm.get_current_map();
      this.sprite.material.map = map;
      this.scene.add(this.sprite);
    }

    this.subscribe(`update.${this._entity.name}.position`, (msg) => this._on_update_position(msg));
  }

  _init(props) {
    const material = new SpriteMaterial({ map: props.map });
    this.sprite = new Sprite(material);
    this.sprite.geometry.computeBoundingBox();
    const position = new Vector2().copy(props.position).add(this.sprite.geometry.boundingBox.max);
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
    this.sprite.position.z = this.layer;

    this.scene.add(this.sprite);

    this.loaded = true;
  }

  _on_update_position(msg) {
    const position = msg.value;
    this.sprite.position.x = position.x;
    this.sprite.position.y = position.y;
  }
}
