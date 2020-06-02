import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";

export default function (Vue) {
  let requireComponent = require.context("./", true, /\.vue$/);

  requireComponent.keys().forEach((fileName) => {
    const componentConfig = requireComponent(fileName);

    let config = componentConfig.default || componentConfig;

    let componentName =
      config.name ||
      upperFirst(
        camelCase(fileName.replace("index.vue", "").replace(/\.\w+$/, ""))
      );
    Vue.component(componentName, config);
  });
}
