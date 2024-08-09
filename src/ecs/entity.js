

export class EntityManager {
  constructor() {
    this._ids = 0;
    this._entities_map = {};
    this._entities = [];
    this._systems = [];
  }

  init() {
    console.log("EntityManager.init");
    this._entities.forEach((entity) => {
      entity.init();
    });
  }

  _generate_name() {
    this._ids += 1;
    return '__entity__' + this._ids;
  }

  get(n) {
    return this._entities_map[n];
  }

  filter(cb) {
    return this._entities.filter(cb);
  }

  _add(e, n) {
    if (!n) {
      n = this._generate_name();
    }

    this._entities_map[n] = e;
    this._entities.push(e);

    e.set_manager(this);
    e.set_name(n);
  }

  create(n = null) {
    if (!n) {
      n = this._generate_name();
    }

    const e = new Entity();
    this._add(e, n);

    return e;
  }

  destroy(e) {
    const i = this._entities.indexOf(e);
    if (i < 0) {
      return;
    }

    this._entities.splice(i, 1);
  }

  update(delta_time_s) {
    for (let e of this._entities) {
      e.update(delta_time_s);
    }
  }
}


class Entity {
  constructor() {
    this._name = null;
    this._components = {};
    this._handlers = {};
    this._manager = null;
  }

  init() {
    for (const [_, c] of Object.entries(this._components))
    {
      console.log("Entity.init");
      c.init_component();
    }
  }

  set_name(n) {
    this._name = n;
  }

  set_manager(em) {
    this._manager = em;
  }

  destroy() {
    this._manager.destroy(this);
  }

  add_component(c) {
    c.set_entity(this);
    this._components[c.constructor.name] = c;
  }

  get_component(n) {
    return this._components[n];
  }

  find_entity(n) {
    return this._manager.get(n);
  }

  subscribe(topic, handler) {
    if (!(topic in this._handlers)) {
      this._handlers[topic] = [];
    }
    this._handlers[topic].push(handler);
  }

  publish(msg) {
    if (!(msg.topic in this._handlers)) {
      return;
    }

    for (let handler of this._handlers[msg.topic]) {
      handler(msg);
    }
  }

  update(delta_time_s) {
    for (let k in this._components) {
      this._components[k].update(delta_time_s);
    }
  }
}