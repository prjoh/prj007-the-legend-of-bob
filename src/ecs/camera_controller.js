import * as THREE from '../vendor/three/build/three.module.js';
import {Layers} from '../layers.js';
import {Easing} from '../easing.js';
import {Debug} from "../debug.js";
import {Component} from "./component.js";


export class CameraController extends Component {
  constructor(props) {
    super();
    this.scene = props.scene;
    this.camera = props.camera;
    this.player_position = null;
    this.map_bounds = null;
    this.camera_bounds = new THREE.Box2();
    // screen fade
    this.screen_fade = null;  // threejs material
    this.easing = Easing.linear;
    this.do_fade_animation = false;
    this.fade_animation_duration = 1.0;
    this.fade_animation_elapsed = 0.0;
    this.fade_animation_start = 0.0;
    this.fade_animation_end = 1.0;

    this.update_camera_bounds();
    this._setup_screen_fade();
  }

  init_component() {
    const level = this.find_entity('level');
    const level_component = level.get_component('LevelComponent');
    this.map_bounds = new THREE.Box2(new THREE.Vector2(0.0, 0.0), new THREE.Vector2(level_component.width, level_component.height));
    this.update_camera_bounds();

    console.log("CameraController.init");
    const player = this.find_entity('player');
    this.player_position = player.get_component('CharacterController').get_position();

    console.log(player);

    this.subscribe(`update.${player.name}.position`, (msg) => { this.player_position.copy(msg.value); });
  }

  _setup_screen_fade() {
    const geometry = new THREE.PlaneGeometry( 64, 32 );
    this.screen_fade = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.BackSide, transparent: true} );
    const plane = new THREE.Mesh( geometry, this.screen_fade );
    plane.position.z = Layers.FADE;
    this.camera.add( plane );
  }

  update_camera_bounds() {
    if (this.map_bounds == null)
      return;

    const min = new THREE.Vector2().copy(this.map_bounds.min);
    min.x -= this.camera.left;
    min.y += this.camera.top;
    const max = new THREE.Vector2().copy(this.map_bounds.max);
    max.x -= this.camera.right;
    max.y += this.camera.bottom;
    this.camera_bounds.min = min;
    this.camera_bounds.max = max;

    if (this.debug_draw != null)
      this.scene.remove(this.debug_draw);
    this.debug_draw = Debug.draw_box2(this.camera_bounds);
  }

  set_fade_color(color) {
    this.screen_fade.color = color;
  }

  fade_in(time_s, easing = Easing.linear) {
    this.easing = easing;
    this.screen_fade.opacity = 0.0;
    this.fade_animation_start = 1.0;
    this.fade_animation_end = 0.0;
    this.fade_animation_delta = this.fade_animation_end - this.fade_animation_start;
    this.fade_animation_elapsed = 0.0;
    this.fade_animation_duration = time_s;
    this.do_fade_animation = true;
  }

  fade_out(time_s, easing = Easing.linear) {
    this.easing = easing;
    this.screen_fade.opacity = 0.0;
    this.fade_animation_start = 0.0;
    this.fade_animation_end = 1.0;
    this.fade_animation_delta = this.fade_animation_end - this.fade_animation_start;
    this.fade_animation_elapsed = 0.0;
    this.fade_animation_duration = time_s;
    this.do_fade_animation = true;
  }

  update(delta_time_s) {
    this.camera.position.x = Math.max(this.camera_bounds.min.x, Math.min(this.camera_bounds.max.x, this.player_position.x));
    this.camera.position.y = Math.max(this.camera_bounds.min.y, Math.min(this.camera_bounds.max.y, this.player_position.y));

    if (this.do_fade_animation)
    {
      this.fade_animation_elapsed += delta_time_s;

      if(this.fade_animation_elapsed >= this.fade_animation_duration)
      {
        this.screen_fade.opacity = this.fade_animation_end;
        this.do_fade_animation = false;
      }
      else
        this.screen_fade.opacity = this.fade_animation_start + this.fade_animation_delta * this.easing(this.fade_animation_elapsed / this.fade_animation_duration);
    }
  }
}