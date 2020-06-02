## API

### Widgets

#### Widget's options

```js
import MyWidget from "./Component";
import MyWidgetPreview from "./Preview";

// widget's options
let widgetOptions = {
  name: "MyWidget", // must be unique
  component: MyWidget, // component of component name if registered globally
  preview: MyWidgetPreview, // same
  configurator: "DefaultWidgetConfigurator", // same
  title: "my widget", // human readable friendly title (for display purposes)
  icon: "fa-bicycle",
};
```

#### Adding a widget

```js
import Vue from "vue";
Vue.$widgets.add(widgetOptions);

// or directly inside of a component
export default {
  name:"foo",
  ...,
  created(){
    this.$widgets.add(widgetOptions);
  }
  ...
}
```

#### Widget Configurator

##### Event: 'configured'

should be sent with widget's props as payload in order to configure it

##### Event: 'cancel'

cancels the configuration process
