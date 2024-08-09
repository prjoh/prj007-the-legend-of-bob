import * as THREE from './vendor/three/build/three.module.js'
import Stats from './stats.js';

import {LoadingManager} from './loading_manager.js';
import {Scene} from './scene.js';
import {Layers} from './layers.js';
import {Debug} from './debug.js';
import {YSort} from './y_sort.js';
import {CameraController} from './ecs/camera_controller.js';
import {Easing} from './easing.js';
import {LevelComponent, LevelData} from "./ecs/level.js";
import {EntityManager} from "./ecs/entity.js";
import {Graphic} from "./ecs/graphic.js";
import {CharacterController} from "./ecs/character_controller.js";
import {DynamicCollider} from "./ecs/collider.js";
import {YSortController} from "./ecs/y_sort_controller.js";


export class Game {
  constructor() {
    // Member variables
    this.debug_mode = true;
    this.request_update = true;
    this.request_update_id = null;
    this.frustum_size = 16;
    // HTML element references
    this.canvas = document.getElementById('canvas');
    this.canvas_parent = document.getElementById('game');
    // Threejs resources
    this.renderer = new THREE.WebGLRenderer();
    this.clock = new THREE.Clock();
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -this.frustum_size * aspect / 2,
      this.frustum_size * aspect / 2,
      this.frustum_size / 2,
      -this.frustum_size / 2,
      0,
      -1000);

    // Move coordinate origin to top-left of screen
    this.camera.scale.y = -1;  // This causes geometry to be flipped. Make sure to render backside!
    this.camera.position.x = this.frustum_size * aspect / 2;
    this.camera.position.y = this.frustum_size / 2;

    this.scene = Scene.instance();

    this.entity_manager = new EntityManager();

    // Stats module
    this.stats = new Stats();

    this.init();
  }

  init() {
    this.renderer.powerPreference = "high-performance";
    this.renderer.antialias = false;
    this.renderer.gammaFactor = 2.2;
    this.renderer.outputEncoding = THREE.LinearEncoding;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.canvas.appendChild(this.renderer.domElement);

    this.scene.add(this.camera);
    this.scene.background = new THREE.Color(0x000000);

    const y_sort = new YSort(Layers.PLAYER);

    // TODO: Do we really want to store collision data like this?
    const level_data = new LevelData({
      background: './res/level/bg.png',
      tile_data: [
        {
          path_prefix: './res/level/01',
          width: 384,
          height: 2048,
          layer: Layers.PLAYER,
          has_collision: true,
          collider_size: new THREE.Vector2(1.0, 1.0),
        },
        {
          path_prefix: './res/level/02',
          width: 512,
          height: 512,
          layer: Layers.GRASS,
          has_collision: false,
        },
      ],
    });
    this.level = this.entity_manager.create('level');
    this.level.add_component(new LevelComponent({
      entity_manager: this.entity_manager,
      scene: this.scene,
      level_data: level_data,
      y_sort: y_sort,
    }));

    this.player = this.entity_manager.create('player');
    this.player.add_component(new CharacterController({
      position: new THREE.Vector2(8.5, 8.5),
      speed: 4.5,
      // animation data
      animation_props: {
        clock: this.clock,
        fps: 6,
        animations: [
          {
            path: 'player/run',
            states: ['IdleState', 'RunState'],
          },
          {
            path: 'player/fight',
            states: ['AttackState'],
          },
        ],
      },
    }));
    this.player.add_component(new Graphic({
      size: new THREE.Vector2(1.0, 1.0),
      scene: this.scene,
      position: new THREE.Vector2(8.0, 8.0),
      layer: Layers.PLAYER,
      animated: true,
    }));
    this.player.add_component(new DynamicCollider({
      position: new THREE.Vector2(8.5, 8.5),
      collider_size: new THREE.Vector2(0.9, 0.75),
    }));
    this.player.add_component(new YSortController({
      y_sort: y_sort,
    }));

    this.game_camera = this.entity_manager.create('game-camera');
    this.game_camera.add_component(new CameraController({
      camera: this.camera,
      player: this.player,
      scene: this.scene,
    }));


    if (this.debug_mode) {
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.canvas_parent.appendChild(this.stats.dom);

      Debug.init();
    }

    LoadingManager.init(() => {
      this.set_event_handlers();

      this.entity_manager.init();

      console.log("Running.");
      this.game_camera.get_component('CameraController').fade_in(2.0, Easing.in_cubic);
      this.run();
    });

    // this.cursor = new THREE.Vector3(0, 0, 0);
    // addEventListener(
    //   "mousemove",
    //   (e) => {
    //     e.preventDefault();
    //     this.cursor.set((e.clientX / window.innerWidth ) * 2 - 1,
    //                    -(e.clientY / window.innerHeight ) * 2 + 1,
    //                    0);
    //     this.cursor.unproject(this.camera);
    //   },
    //   { passive: false }
    // );

    // this.ray = Debug.draw_ray(new THREE.Vector2(8, 8), new THREE.Vector2(-1, 1), 0x00ff00);
    // Debug.draw_circle(new THREE.Vector2(8, 8), 0.1, 0x00ff00);
  }

  run() {
    if (this.request_update)
      this.request_update_id = requestAnimationFrame(() => this.run());

    const delta_time_s = this.clock.getDelta();

    // Update objects here
    this.stats.update();
    this.entity_manager.update(delta_time_s);

    // Debug.print(`${this.cursor.x},${this.cursor.y}`);
    // let p = this.ray.geometry.attributes.position.array;
    // p[3] = this.cursor.x;
    // p[4] = this.cursor.y;
    // this.ray.geometry.attributes.position.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  set_event_handlers() {
    window.addEventListener('focus', (event) => this.set_request_update(true));
    window.addEventListener('blur', (event) => this.set_request_update(false));
    window.addEventListener('resize', (event) => this.on_window_resize());
    // document.onmousekey_pressed = (event) => { on_mouse_move(event); };
    // document.onpointerlockchange = (event) => { this.on_pointer_lock_change() };
    // TODO: this does not work anymore
    // this.renderer.domElement.addEventListener('click', (event) => {
    //   this.renderer.domElement.requestPointerLock().catch(() => {
    //     setTimeout(() => {
    //       this.renderer.domElement.requestPointerLock();
    //     }, 1500);
    //   });
    // });
  }

  set_request_update(is_active) {
    if (this.request_update_id !== null)
      cancelAnimationFrame(this.request_update_id);

    if (is_active) {
      this.request_update = true;
      this.run();
    } else {
      this.request_update = false;
    }
    console.log("renderer_active=" + is_active)
  }

  on_window_resize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = -this.frustum_size * aspect / 2;
    this.camera.right = this.frustum_size * aspect / 2;
    this.camera.top = this.frustum_size / 2;
    this.camera.bottom = -this.frustum_size / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.game_camera.get_component('CameraController').update_camera_bounds();
  }
}
