import {FiniteStateMachine, State} from './state_machine.js'
import {AnimationData} from "../animation.js";


export class AnimationFSM extends FiniteStateMachine {
  constructor(props) {
    super();

    this.animation_data = {};
    props.animations.forEach((a) => {
      const animation_data = new AnimationData({
        path: a.path,
      });
      a.states.forEach((state) => {
        const state_type = eval(state);  // TODO: Catch undefined type exception
        this.add_state(state, state_type);
        this.animation_data[state] = animation_data;
      });
    });
    this.fps = props.fps;
    this.clock = props.clock;
    this.last_direction = 'down';
  }

  // TODO
  get_current_map()
  {
    return this.animation_data[this._current_state.name].sprite_sheet.map;
  }

  update_animation() {
    const t = this.clock.getElapsedTime();
    const ad_key = this._current_state.name;
    const sa_key = `${this._current_state.name}_${this.last_direction}`
    const animation = this.animation_data[ad_key].sheet_animations[sa_key];
    const frame_ndx = Math.floor((t * this.fps) % animation.length);
    const sheet_id = animation.frames[frame_ndx];
    const sprite_sheet = this.animation_data[ad_key].sprite_sheet;
    const [x, y] = sprite_sheet.get_offset(sheet_id);

    sprite_sheet.map.offset.x = x;
    sprite_sheet.map.offset.y = y;
    sprite_sheet.map.needsUpdate = true;
  }
}

class IdleState extends State {
  constructor(parent) {
    super(parent);
  }

  get name() {
    return this.constructor.name;
  }

  enter(prevState) {
    this._state_machine.update_animation();
  }

  exit() {
  }

  update(_, input) {
    if (input.up || input.down || input.left || input.right)
      this._state_machine.set_state('RunState');
  }
}

class RunState extends State {
  constructor(state_machine) {
    super(state_machine);
  }

  get name() {
    return this.constructor.name;
  }

  enter(prevState) {
  }

  exit() {
  }

  update(_, input) {
    if (input.up)
    {
      this._state_machine.last_direction = 'up';
      this._state_machine.update_animation();
    }
    else if (input.down)
    {
      this._state_machine.last_direction = 'down';
      this._state_machine.update_animation();
    }
    else if (input.left)
    {
      this._state_machine.last_direction = 'left';
      this._state_machine.update_animation();
    }
    else if (input.right)
    {
      this._state_machine.last_direction = 'right';
      this._state_machine.update_animation();
    }
    else
      this._state_machine.set_state('IdleState');
  }
}

class AttackState extends State {
  constructor(state_machine) {
    super(state_machine);
  }

  get name() {
    return this.constructor.name;
  }

  enter(prevState) {
  }

  exit() {
  }

  update(timeElapsed, input) {
  }
}
