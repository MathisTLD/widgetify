<template>
  <div class="view-grid-wrapper" :style="{ height, width }">
    <div :style="{ ...gridTemplate }" class="view-grid">
      <div
        v-for="area in view.areas"
        :key="area.id"
        :ref="area.id"
        class="view-grid-area"
        :style="{
          'grid-area': area.id,
        }"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    height: {
      default: "100%",
    },
    width: {
      default: "100%",
    },
  },
  computed: {
    view() {
      return this.$views.get(this.id);
    },
    gridTemplate() {
      let { areas, rows, columns } = this.view.template;
      let gridTemplateAreas = areas
        .map((line) => '"' + line.join(" ") + '"')
        .join(" ");
      let gridTemplateRows = rows.join(" ");
      let gridTemplateColumns = columns.join(" ");
      return { gridTemplateAreas, gridTemplateRows, gridTemplateColumns };
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let vm = this;
      let widgets = vm.$widgets;
      this.view.areas.forEach((area) => {
        let widget = widgets.get(area.widget);

        let { vuetify } = this.$root.$options;
        let component = vm.$loadComponent(widget.component, {
          // https://vuejs.org/v2/api/#propsData
          propsData: {
            ...area.props,
          },
          vuetify,
        });

        let container = vm.$refs[area.id][0];
        if (container) {
          component.$mountOnChild(container);
          component.$on("fullscreen", (val) => vm.toggleFullscreen(area, val));
        }
      });
    },
    toggleFullscreen(area, val) {
      let container = this.$refs[area.id][0];
      let { rows, columns } = this.view.template;
      let [r, c] = [rows.length, columns.length];
      container.style.gridArea = val
        ? [1, 1, r + 1, c + 1].join(" / ")
        : area.id;
      container.style.zIndex = val ? "10" : "";
    },
  },
  beforeDestroy() {},
};
</script>

<style scoped>
.view-grid-wrapper {
  display: block;
}
.view-grid {
  height: 100%;
  width: 100%;
  display: grid;
  grid-gap: 0px;
}
.view-grid-area {
  overflow: hidden;
}
.view-grid-area > * {
  height: 100%;
  width: 100%;
}
</style>
