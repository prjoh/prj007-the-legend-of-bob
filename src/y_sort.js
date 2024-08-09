

export class YSort {
  constructor(layer, resolution = 1000) {
    this._sorted = [];
    this._layer = layer;
    this._resolution = resolution;
  }

  add_graphic(g) {
    this._sorted.push(g);
  }

  remove_graphic(g) {
    const i = this._sorted.indexOf(g);
    if (i < 0) {
      return;
    }

    this._sorted.splice(i, 1);  }

  sort() {
    this._sorted.sort((a, b) => {
      const x = a.sprite.position.y;
      const y = b.sprite.position.y;
      return (x < y) ? -1 : (x > y) ? 1 : 0;
    });

    let depth = this._resolution - 1;
    let last_y = this._sorted[0].sprite.position.y;
    this._sorted.forEach((obj) => {
      if (obj.sprite.position.y !== last_y)
      {
        depth -= 1;
        last_y = obj.sprite.position.y;
      }
      obj.sprite.position.z = this._layer + depth / this._resolution;
    });
  }
}