class Widget {
  constructor({ name, component, preview, configurator, title, icon }) {
    if (!name) throw new Error("a widget must have a name");
    this.name = name;

    Object.assign(
      this,
      { configurator: "DefaultWidgetConfigurator" },
      { component, preview, configurator }
    );
    ["component", "preview", "configurator"].forEach(function (prop) {
      if (!this[prop])
        throw new Error(`widget ${name} must have a ${prop} prop`);
    }, this);

    this.icon = icon || "fa-cog";
    this._title = title || "";
  }
  get title() {
    return this._title || this.name;
  }
  static getArray() {
    return Object.values(Widget._widgets);
  }
  static get(name) {
    let widget = Widget._widgets[name];
    if (widget) return widget;
    else throw new Error(`Unknown widget ${name}`);
  }
  static add(options) {
    let widget = new Widget(options);
    Widget._widgets[widget.name] = widget;
  }
  static _widgets = {};
}

export default Widget;
