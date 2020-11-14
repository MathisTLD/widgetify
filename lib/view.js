import { v4 as uuid } from "uuid";

import _max from "lodash/max";

class View {
  constructor({ id, index, name, areas, template } = {}) {
    this.id = id || uuid();
    this._index = Number(index || View.getHighestIndex() + 1);

    this.name = name || `View #${this.index}`;
    this.areas = areas || [];
    this.template = template || {
      areas: [
        [".", "."],
        [".", "."],
      ],
      rows: ["1fr", "1fr"],
      columns: ["1fr", "1fr"],
    };
  }
  save() {
    View.set(this.id, this);
  }
  set index(val) {
    if (View.array.map((view) => view.index).includes(val))
      this.index = val + 1;
    else this._index = val;
  }
  get index() {
    return this._index;
  }
  static get(id) {
    let view = View._views[id];
    if (!view) throw new Error(`Unknown view : ${id}`);
    else return view;
  }
  static getByIndex(index) {
    for (var view of View.array) {
      if (view.index == index) return view;
    }
    throw new Error(`can't find a view with index ${index}`);
  }
  static set(id, view) {
    View._views[id] = view;
  }
  static delete(id) {
    delete View._views[id];
  }
  static create(opts) {
    let view = new View(opts);
    view.save();
    return view;
  }
  static load(opts) {
    let view = new View(opts);
    view.save();
  }
  static get array() {
    return Object.values(View._views);
  }
  static getActive() {
    // FIXME: this is actually faking it
    return Object.values(View._views)[0];
  }
  static getHighestIndex() {
    return _max(View.array.map((view) => view.index)) || 0;
  }
  static _views = {};
}

export default View;
