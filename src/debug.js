import {Mesh, PlaneGeometry, MeshBasicMaterial, Vector3, Box3, Box3Helper, BufferGeometry, LineBasicMaterial,
        Line, BufferAttribute, CircleGeometry} from './vendor/three/build/three.module';
import {Scene} from './scene.js';
import {Layers} from './layers.js';
import TextSprite from './text.js';


const scene = Scene.instance();

let is_init = false;
let debug_bg = null;
let debug_sprite = null;
let debug_text = [null, null];
let is_visible = false;

function on_key_down(event)
{
  switch (event.key) {
    case '`':
      if (is_visible)
        Debug.hide();
      else
        Debug.show();
      break;
    default:
  }
}


export const Debug = {
  init() {
    const rect_width = 16;
    const rect_height = 1;
    debug_bg = new Mesh(
      new PlaneGeometry(rect_width, rect_height, 1, 1),
      new MeshBasicMaterial({ color: 0x0000ff })
    );
    debug_bg.scale.z = -1;
    debug_bg.position.x = rect_width * 0.5;
    debug_bg.position.y = rect_height * 0.5;
    debug_bg.position.z = Layers.DEBUG_TEXT;

    debug_text[0] = '--- The Legend Of Bob ---';
    debug_text[1] = 'Debug Console v1.0';

    debug_sprite = new TextSprite({
      alignment: 'left',
      // backgroundColor: '#0000ff',
      color: '#fff',
      fontFamily: 'OrangeKid',
      fontSize: 0.4,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      lineGap: 0.25,
      padding: 0.1,
      strokeColor: '#fff',
      strokeWidth: 0,
      text: debug_text.join('\n'),
    });
    debug_sprite.position.x = debug_sprite.material.map.width * 0.5;
    debug_sprite.position.y = debug_sprite.material.map.height * 0.5;
    debug_sprite.position.z = Layers.DEBUG_TEXT;

    document.addEventListener('keydown', on_key_down);

    is_init = true;
  },

  show() {
    if (is_init === false)
      throw new Error("Called function of uninitialized module 'Debug'.");
    scene.add(debug_bg);
    scene.add(debug_sprite);
    is_visible = true;
  },

  hide() {
    if (is_init === false)
      throw new Error("Called function of uninitialized module 'Debug'.");
    scene.remove(debug_bg);
    scene.remove(debug_sprite);
    is_visible = false;
  },

  print(text, line = 0) {
    if (is_init === false)
      throw new Error("Called function of uninitialized module 'Debug'.");
    debug_text[line] = text;
    debug_sprite.text = debug_text.join('\n');
    debug_sprite.position.x = debug_sprite.material.map.width * 0.5;
    debug_sprite.position.y = debug_sprite.material.map.height * 0.5;
  },

  draw_rect(center, size, color = 0xffffff) {
    const box = new Box3();
    box.setFromCenterAndSize(
      new Vector3(center.x, center.y, Layers.DEBUG_DRAW),
      new Vector3(size.x, size.y, Layers.DEBUG_DRAW)
    );
    const helper = new Box3Helper(box, color);
    scene.add(helper);
    return helper;
  },

  draw_box2(box2, color = 0xffffff) {
    const min = new Vector3(box2.min.x - 0.025, box2.min.y - 0.025, Layers.DEBUG_DRAW);
    const max = new Vector3(box2.max.x + 0.025, box2.max.y + 0.025, Layers.DEBUG_DRAW);
    const box = new Box3(min, max);
    const helper = new Box3Helper(box, color);
    scene.add(helper);
    return helper;
  },

  draw_circle(point, radius, color = 0xffffff) {
    const geometry = new CircleGeometry(radius, 32);
    const material = new MeshBasicMaterial( { color: color } );
    const circle = new Mesh( geometry, material );
    circle.scale.z = -1;
    circle.position.x = point.x;
    circle.position.y = point.y;
    circle.position.z = Layers.DEBUG_DRAW;
    scene.add(circle)
    return circle;
  },

  draw_ray(point, vector, color = 0xffffff) {
    const material = new LineBasicMaterial( { color: color } );
    const points = new Float32Array([
      point.x, point.y, Layers.DEBUG_DRAW,
      point.x + vector.x, point.y + vector.y, Layers.DEBUG_DRAW
    ]);
    const geometry = new BufferGeometry();
    geometry.setAttribute( 'position', new BufferAttribute( points, 3 ) );
    const line = new Line( geometry, material );
    scene.add(line);
    return line;
  }
}
