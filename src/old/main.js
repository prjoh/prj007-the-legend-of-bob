import * as THREE from './vendor/three/build/three.module'
import Stats from './stats';
import {FontLoader} from "./vendor/three/examples/jsm/loaders/FontLoader";


function set_event_handlers() {
  window.onfocus = (event) => { set_request_update(true); };
  window.onblur = (event) => { set_request_update(false); };
  window.onresize = (event) => { on_window_resize(); };
  document.onmousekey_pressed = (event) => { on_mouse_move(event); };
  document.onkeydown = (event) => { on_key_down(event); };
  document.onkeyup = (event) => { on_key_up(event); };
  document.onpointerlockchange = (event) => { on_pointer_lock_change() };
}
set_event_handlers();

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
  antialias: false,
});
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.LinearEncoding;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.85);
renderer.domElement.onclick = (event) => {
  renderer.domElement.requestPointerLock().catch(() => {
    setTimeout(() => { renderer.domElement.requestPointerLock(); }, lock_timeout);
  });
};
canvas.appendChild(renderer.domElement);


const canvas_parent = document.getElementById('game');
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
canvas_parent.appendChild(stats.dom)

const fov = 50;
const aspect = window.innerWidth / window.innerHeight;
const near = 1.0;
const far = 1000.0;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(8, -6, 13);

// const camera_ui = document.getElementById("ui-camera");
// function update_camera_ui() {
//   camera_ui.innerText = `CAMERA\n\nPosition:\n`
//     + `X: ${Math.round((camera.position.x + Number.EPSILON) * 100) / 100}\n`
//     + `Y: ${Math.round((camera.position.y + Number.EPSILON) * 100) / 100}\n`
//     + `Z: ${Math.round((camera.position.z + Number.EPSILON) * 100) / 100}\n`
//     + `\nRotation (Euler):\n`
//     + `X: ${Math.round((camera.rotation.x + Number.EPSILON) * 100) / 100}\n`
//     + `Y: ${Math.round((camera.rotation.y + Number.EPSILON) * 100) / 100}\n`
//     + `\nRotation (Quaternion):\n`
//     + `X: ${Math.round((camera.quaternion.x + Number.EPSILON) * 100) / 100}\n`
//     + `Y: ${Math.round((camera.quaternion.y + Number.EPSILON) * 100) / 100}\n`
//     + `Z: ${Math.round((camera.quaternion.z + Number.EPSILON) * 100) / 100}\n`
//     + `W: ${Math.round((camera.quaternion.w + Number.EPSILON) * 100) / 100}`
// }


const loading_manger = new THREE.LoadingManager();
loading_manger.onStart = (path, items_loaded, items_total) => {
  console.log("Started loading file: " + path + ".\nLoaded " + items_loaded + " of " + items_total + " files.");
};
loading_manger.onProgress = (path, items_loaded, items_total) => {
  console.log("Loading file: " + path + ".\nLoaded " + items_loaded + " of " + items_total + " files.");
};
loading_manger.onLoad = () => {
  console.log("Loading complete!");
  set_event_handlers();
  set_request_update(true);
};
loading_manger.onError = (path) => {
  console.log("There was an error loading " + path);
};

const font_loader = new FontLoader(loading_manger);
function load_font(font_name, text_obj_instance)
{
  font_loader.load(font_paths[font_name], (font) => {
    fonts[font_name] = font;
    text_obj_instance.obj = create_text_mesh(text_obj_instance.text,
                                             font,
                                             text_obj_instance.color1,
                                             text_obj_instance.color2,
                                             text_obj_instance.spawn,
                                             text_obj_instance.parameters);
  });
}


const scene = new THREE.Scene();
let player_sprite;
let player_ndx = new THREE.Vector2(1, 1);
let map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
function init_scene() {
  scene.background = new THREE.Color(0x000000);

  const bg = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 12, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  bg.position.x = 8;
  bg.position.y = -6;
  scene.add(bg);

  const world = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 11, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xfad8a8 })
  );
  world.position.x = 8;
  world.position.y = -6.5;
  scene.add(world);

  player_sprite = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x57A90D })
  );
  player_sprite.position.x = 1.5;
  player_sprite.position.y = -2.5;
  scene.add(player_sprite);
}
init_scene();


function on_window_resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.85);
}

const pointer = new THREE.Vector2();
function on_mouse_move(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let Key = {
  NULL: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
}
let key_pressed = Key.NULL;
function on_key_down(event) {
  switch (event.keyCode) {
    case 87: // w
      key_pressed = Key.UP;
      break;
    case 65: // a
      key_pressed = Key.LEFT;
      break;
    case 83: // s
      key_pressed = Key.DOWN;
      break;
    case 68: // d
      key_pressed = Key.RIGHT;
      break;
    default:
  }
}

function on_key_up(event) {
  switch (event.keyCode) {
    case 87: // w
      if (key_pressed == Key.UP)
        key_pressed = Key.NULL;
      break;
    case 65: // a
      if (key_pressed == Key.LEFT)
        key_pressed = Key.NULL;
      break;
    case 83: // s
      if (key_pressed == Key.DOWN)
        key_pressed = Key.NULL;
      break;
    case 68: // d
      if (key_pressed == Key.RIGHT)
        key_pressed = Key.NULL;
      break;
    default:
  }
}


let is_locked = false;
let lock_timeout = 0;
function on_pointer_lock_change() {
  if (document.pointerLockElement === renderer.domElement)
    is_locked = true;
  else {
    is_locked = false;
    lock_timeout = 1500;
  }
}


let player_moving = false;
let player_move_from = new THREE.Vector3();
let player_move_to = new THREE.Vector3();
function try_player_move() {
  if (key_pressed == Key.UP && map[player_ndx.x][player_ndx.y - 1] == 1)
  {
    player_move_from.copy(player_sprite.position);
    player_move_to.x = player_sprite.position.x;
    player_move_to.y = player_sprite.position.y + 1;
    player_ndx.y -= 1;
    player_moving = true
  }
  else if (key_pressed == Key.DOWN && map[player_ndx.x][player_ndx.y + 1] == 1)
  {
    player_move_from.copy(player_sprite.position);
    player_move_to.x = player_sprite.position.x;
    player_move_to.y = player_sprite.position.y - 1;
    player_ndx.y += 1;
    player_moving = true
  }
  else if (key_pressed == Key.LEFT && map[player_ndx.x - 1][player_ndx.y] == 1)
  {
    player_move_from.copy(player_sprite.position);
    player_move_to.x = player_sprite.position.x - 1;
    player_move_to.y = player_sprite.position.y;
    player_ndx.x -= 1;
    player_moving = true;
  }
  else if (key_pressed == Key.RIGHT && map[player_ndx.x + 1][player_ndx.y] == 1)
  {
    player_move_from.copy(player_sprite.position);
    player_move_to.x = player_sprite.position.x + 1;
    player_move_to.y = player_sprite.position.y;
    player_ndx.x += 1;
    player_moving = true;
  }
  else
    player_moving = false;
}


let elapsed = 0;
const duration = 200;
function update_player_sprite(delta) {
  if (!player_moving)
    return

  elapsed += delta * 1000;
  player_sprite.position.lerpVectors(player_move_from, player_move_to, elapsed / duration);

  if (elapsed >= duration)
  {
    player_moving = false;
    player_sprite.position.copy(player_move_to);
    elapsed = 0;
  }
}


let request_update;
let request_update_id = null;
function set_request_update(is_active) {
  if (request_update_id !== null)
    cancelAnimationFrame(request_update_id);

  if (is_active)
  {
    request_update = true;
    update();
  }
  else
    request_update = false;
  console.log("renderer_active=" + is_active)
}

const clock = new THREE.Clock();
function update() {
  if (request_update)
    request_update_id = requestAnimationFrame(update);

  const delta = clock.getDelta();

  // Update objects here
  if (key_pressed != Key.NULL && !player_moving)
    try_player_move();

  update_player_sprite(delta);

  stats.update();

  renderer.render(scene, camera);
}
set_request_update(true);
