import {Component} from "./component.js";


export class YSortController extends Component {
  constructor(props) {
    super();
    this.y_sort = props.y_sort;
  }

  init_component() {
    const graphic = this.get_component('Graphic');
    this.y_sort.add_graphic(graphic);
    this.subscribe(`update.${this._entity.name}.position`, (msg) => this.y_sort.sort());
  }
}