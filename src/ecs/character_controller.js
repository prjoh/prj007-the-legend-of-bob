import {Component} from "./component.js";
import * as THREE from "../vendor/three/build/three.module.js";
import {AnimationFSM} from "../fsm/animation_fsm.js";


export class CharacterController extends Component {
  constructor(props) {
    super();
    this._input = {
      'up': 0,
      'down': 0,
      'left': 0,
      'right': 0,
    }
    this._position = new THREE.Vector2().copy(props.position);
    this._direction = new THREE.Vector2(0,0);
    this._speed = props.speed;

    this._animation_fsm = new AnimationFSM(props.animation_props);

    document.addEventListener('keydown',(event) => { this._on_key_down(event) });
    document.addEventListener('keyup',(event) => { this._on_key_up(event) });
  }

  get_position() {
    return this._position;
  }

  init_component() {
    this._animation_fsm.set_state('IdleState');
  }

  update(delta_time_s) {
    const graphic = this.get_component('Graphic');
    if (!graphic.loaded)
      return;

    this._animation_fsm.update(delta_time_s, this._input);

    this._direction.x = this._input.left * -1 + this._input.right;
    this._direction.y = this._input.up * -1 + this._input.down;
    this._direction.normalize();

    if (this._direction.length() === 0)
      return;

    const collider = this.get_component('DynamicCollider');
    collider.velocity.copy(this._direction).multiplyScalar(this._speed * delta_time_s);
    collider.handle_collisions();
    this._position.add(collider.velocity);

    this.publish({
      topic: `update.${this._entity.name}.position`,
      value: this._position,
    });
  }

  _on_key_down(event) {
    switch (event.key) {
      case 'w': // w
        this._input.up = 1;
        break;
      case 'a': // a
        this._input.left = 1;
        break;
      case 's': // s
        this._input.down = 1;
        break;
      case 'd': // d
        this._input.right = 1;
        break;
      default:
    }
  }

  _on_key_up(event) {
    switch (event.key) {
      case 'w': // w
        this._input.up = 0;
        break;
      case 'a': // a
        this._input.left = 0;
        break;
      case 's': // s
        this._input.down = 0;
        break;
      case 'd': // d
        this._input.right = 0;
        break;
      default:
    }
  }
}