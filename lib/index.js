import Widget from "./widget";
import View from "./view";

import registerComponents from "./components";

export default {
  install(Vue) {
    const $widgets = Widget;
    const $views = View;

    Object.assign(Vue, {
      $widgets,
      $views,
      $getComponent(name) {
        let component = Vue.options.components[name];
        if (!component) throw new Error(`unknown component : ${name}`);
        else return component;
      },
    });

    Object.assign(Vue.prototype, {
      $widgets,
      $views,
      $removeChilds(container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      },
      $mountOnChild(container) {
        //cleanup
        this.$removeChilds(container);
        // create an ephemeral div to mount the component into
        let vueContainer = document.createElement("div");
        // add it to `div#app`
        container.appendChild(vueContainer);
        // mount the Vue component to the ephemeral div, which Vue will remove from DOM
        this.$mount(vueContainer);
      },
      $destroyWithDOM() {
        let domNode = this.$el;
        let container = domNode.parentNode;
        container.removeChild(domNode);
        this.$destroy();
      },
      $loadComponent(comp, opts) {
        let Component =
          typeof comp === "string" ? Vue.$getComponent(comp) : Vue.extend(comp);
        // let $vuetify = this.$root.$vuetify;

        // FIXME: think twice about this "parent" hack
        let parent = this;
        let component = new Component({ parent, ...opts });
        parent.$once("hook:beforeDestroy", () => {
          component.$destroy();
        });
        return component;
      },
    });

    registerComponents(Vue);
  },
};
