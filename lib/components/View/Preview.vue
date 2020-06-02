<template>
  <div
    :style="{ display: 'grid', height, width, ...gridTemplate }"
    class="view-preview"
  >
    <div
      v-for="area in view.areas"
      :key="area.id"
      :ref="area.id"
      class="grid-area"
      :style="{
        'grid-area': area.id
      }"
    />
  </div>
</template>

<script>
export default {
  props: {
    id: {
      required: true
    },
    height: {
      default: "100%"
    },
    width: {
      default: "100%"
    }
  },
  computed: {
    view() {
      return this.$medor.views.get(this.id);
    },
    gridTemplate() {
      let { areas, rows, columns } = this.view.template;
      let gridTemplateAreas = areas
        .map(line => '"' + line.join(" ") + '"')
        .join(" ");
      let gridTemplateRows = rows.join(" ");
      let gridTemplateColumns = columns.join(" ");
      return { gridTemplateAreas, gridTemplateRows, gridTemplateColumns };
    }
  },
  methods: {
    mountPreview(area) {
      let vm = this;
      let widget = this.$medor.widgets.get(area.widget);

      let component = this.$loadComponent(widget.preview, {
        propsData: {
          ...area.props
        }
      });
      let previewContainer = vm.$refs[area.id][0];
      this.$removeChilds(previewContainer);
      component.$mountOnChild(previewContainer);
    }
  },
  mounted() {
    this.view.areas.forEach(this.mountPreview);
  }
};
</script>
