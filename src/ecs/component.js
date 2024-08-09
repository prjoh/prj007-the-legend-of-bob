

export class Component {
  constructor() {
    this._entity = null;
  }

  set_entity(entity) {
    this._entity = entity;
  }

  get_component(n) {
    return this._entity.get_component(n);
  }

  find_entity(n) {
    return this._entity.find_entity(n);
  }

  publish(msg) {
    this._entity.publish(msg);
  }

  subscribe(topic, handler) {
     this._entity.subscribe(topic, handler);
  }

  init_component() {}
  update(_) {}
}