import * as THREE from "../vendor/three/build/three.module.js";
import {Vector2, Vector3} from "../vendor/three/build/three.module.js";
import {Debug} from "../debug.js";
import {Layers} from "../layers.js";
import {Component} from "./component.js";


export class DynamicCollider extends Component {
  constructor(props) {
    super();
    this.velocity = new THREE.Vector2(0, 0);
    // Reference to scene colliders
    this._colliders = null;

    // Init axis-aligned bounding box
    const radius = new THREE.Vector2().copy(props.collider_size).multiplyScalar(0.5);
    const min = new THREE.Vector2().copy(props.position).sub(radius);
    const max = new THREE.Vector2().copy(props.position).add(radius);
    this._aabb = new AABB(min, max);
    this._aabb.debug_draw(0xff0000);
  }

  init_component() {
    const level = this.find_entity('level');
    const level_component = level.get_component('LevelComponent');
    this._colliders = level_component.colliders;

    this.subscribe(`update.${this._entity.name}.position`, (msg) => this._on_update_position(msg));
  }

  _on_update_position(msg) {
    const position = msg.value;
    this._aabb.move_to(position);
  }

  update(_) {
    this._aabb.debug_update();
  }

  handle_collisions() {
    // Do collision check here
    this._colliders.forEach((collider) => {
      let collision = moving_rect_collides_rect(this._aabb, this.velocity, collider._aabb);
      if (collision.hit && collision.t_min >= 0 && collision.t_min < 1)
      {
        const reflect = new THREE.Vector2().copy(collision.normal)
          .multiplyScalar(collision.normal.dot(this.velocity))
          .multiplyScalar(1 - collision.t_min)
          .multiplyScalar(1.001);  // TODO: This is a hack to avoid floating point inaccuracy, causing the player to be moved not enough to resolve collision
        this.velocity.sub(reflect);
      }
    });
  }
}

export class StaticCollider extends Component {
  constructor(props) {
    super();
    // Init axis-aligned bounding box
    const radius = new THREE.Vector2().copy(props.collider_size).multiplyScalar(0.5);
    const min = new THREE.Vector2().copy(props.position).sub(radius);
    const max = new THREE.Vector2().copy(props.position).add(radius);
    this._aabb = new AABB(min, max);
    this._aabb.debug_draw(0xff0000);
  }
}


class AABB {
  constructor(min = new Vector2(), max = new Vector2()) {
    this.min = min;
    this.max = max;
    this.debug = null;
  }

  radius() {
    return new Vector2((this.max.x - this.min.x) * 0.5,
      (this.max.y - this.min.y) * 0.5);
  }

  center() {
    const radius = this.radius();
    return new Vector2(this.max.x - radius.x,
      this.max.y - radius.y);
  }

  move_to(position) {
    const radius = this.radius();
    this.min.x = position.x - radius.x;
    this.min.y = position.y - radius.y;
    this.max.x = position.x + radius.x;
    this.max.y = position.y + radius.y;
  }

  debug_draw(color = 0xffffff) {
    const center = this.center();
    const radius = this.radius();
    this.debug = Debug.draw_rect(center, radius.multiplyScalar(2), color);
  }

  debug_update() {
    if (this.debug)
    {
      const center = this.center();
      const radius = this.radius();
      this.debug.box.setFromCenterAndSize(
        new Vector3(center.x, center.y, Layers.DEBUG_DRAW),
        new Vector3(radius.x * 2, radius.y * 2, Layers.DEBUG_DRAW)
      );
    }
  }
}

function moving_rect_collides_rect(moving_aabb, direction, aabb) {
  const radius = moving_aabb.radius();
  const min = new Vector2().copy(aabb.min).sub(radius);
  const max = new Vector2().copy(aabb.max).add(radius);
  const expanded_aabb = new AABB(min, max);
  return ray_intersects_rect(moving_aabb.center(), direction, expanded_aabb);
}

function ray_intersects_rect(point, direction, aabb) {
  // Ray is parallel to slab. No hit if origin not within slab
  if (Math.abs(direction.x) < Number.EPSILON)
  {
    if (point.x <= aabb.min.x || point.x >= aabb.max.x)
      return {'hit': false};
  }
  if (Math.abs(direction.y) < Number.EPSILON)
  {
    if (point.y <= aabb.min.y || point.y >= aabb.max.y)
      return {'hit': false};
  }

  const inv_dir_x = 1.0 / direction.x;
  const inv_dir_y = 1.0 / direction.y;

  let tx_1 = (aabb.min.x - point.x) * inv_dir_x;
  let tx_2 = (aabb.max.x - point.x) * inv_dir_x;

  let ty_1 = (aabb.min.y - point.y) * inv_dir_y;
  let ty_2 = (aabb.max.y - point.y) * inv_dir_y;

  if (tx_1 > tx_2) [tx_1, tx_2] = [tx_2, tx_1];
  if (ty_1 > ty_2) [ty_1, ty_2] = [ty_2, ty_1];

  if (tx_1 > ty_2 || ty_1 > tx_2)
  {
    return {'hit': false};
  }

  let t_min = Math.max(tx_1, ty_1);
  let t_max = Math.min(tx_2, ty_2);

  // Intersection in opposite move direction
  if (t_max < 0)
  {
    return {'hit': false};
  }

  let cp = new Vector2().copy(point).add(new Vector2().copy(direction).multiplyScalar(t_min));

  let n = new Vector2(0.0, 0.0);
  if (tx_1 > ty_1) {
    if (direction.x < 0) {
      n.x = 1.0;
    }
    else {
      n.x = -1.0;
    }
  }
  else if (tx_1 < ty_1) {
    if (direction.y < 0) {
      n.y = 1.0;
    }
    else {
      n.y = -1.0;
    }
  }

  return {'hit': true, 't_min': t_min, 'point': cp, 'normal': n};
}
