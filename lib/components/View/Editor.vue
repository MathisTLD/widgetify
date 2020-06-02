<template>
  <v-card>
    <v-card-actions>
      <v-container>
        <v-row>
          <v-col cols="10">
            <v-text-field
              v-model="view.name"
              flat
              solo-inverted
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-text-field
              type="number"
              v-model.number="view.index"
              solo
              min="1"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-actions>
    <v-card-text class="pa-0">
      <GridTemplateGenerator
        height="500px"
        :init="view.template"
        :template.sync="view.template"
      >
        <template v-slot:area="area">
          <div class="gridSlot">
            <v-btn
              small
              color="error"
              class="delBtn"
              @click="deleteArea(area)"
              style="z-index: 1000;"
            >
              <v-icon>fa-times</v-icon>
            </v-btn>
            <div class="widgetConfigButtonWrapper">
              <v-menu
                v-if="!areaHasWidget(area.id)"
                bottom
                width="200"
                origin="center center"
                transition="scale-transition"
              >
                <template v-slot:activator="{ on }">
                  <v-btn fab text v-on="on" dark>
                    <v-icon>fa-plus</v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(widget, i) in widgets"
                    :key="i"
                    @click="
                      configureWidget({
                        area,
                        widget,
                      })
                    "
                  >
                    <v-list-item-avatar>
                      <v-icon>{{ widget.icon }}</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>
                      {{ widget.title }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <div
              v-show="activeAreas.includes(area.id)"
              :ref="'preview_' + area.id"
              class="previewWrapper"
            ></div>
          </div>
        </template>
      </GridTemplateGenerator>
    </v-card-text>
    <v-dialog
      ref="widgetConfigDialog"
      v-model="widgetConfigDialog"
      class="widgetConfigDialog"
      scrollable
      eager
    >
      <div ref="widgetConfigContainer" class="widgetConfig"></div>
    </v-dialog>
    <v-card-actions>
      <v-spacer />
      <v-btn color="error" @click="cancel()"><v-icon>fa-times</v-icon></v-btn>
      <v-btn color="success" @click="save()"><v-icon>fa-check</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import _cloneDeep from "lodash/cloneDeep";

export default {
  props: {
    id: {
      required: true,
    },
  },
  data() {
    return {
      activeAreas: [],
      widgetConfigDialog: false,
    };
  },
  watch: {
    widgetConfigDialog(val) {
      if (!val) this.$emit("widgetConfigClosed");
    },
  },
  created() {
    this.view = _cloneDeep(this.$views.get(this.id));
  },
  mounted() {
    this.view.areas.forEach(this.mountPreview);
  },
  computed: {
    widgets() {
      return this.$widgets.getArray();
    },
  },
  methods: {
    close() {
      this.$emit("closed");
    },
    cancel() {
      this.close();
    },
    async save() {
      this.view.save();
      this.close();
    },
    deleteArea(area) {
      this.view.areas = this.view.areas.filter((a) => area.id != a.id);
      this.activeAreas = this.activeAreas.filter((a) => area.id != a.id);
      area.actions.deleteArea(area.id);
    },
    areaHasWidget(areaId) {
      return this.view.areas.some(({ id }) => id === areaId);
    },
    configureWidget({ area, widget }) {
      let vm = this;
      let container = vm.$refs.widgetConfigContainer;

      // generate component
      let component = this.$loadComponent(widget.configurator);

      function configure(props = {}) {
        vm.view.areas = vm.view.areas.filter((a) => area.id != a.id);
        let $area = {
          id: area.id,
          widget: widget.name,
          props,
        };
        vm.view.areas.push($area);
        vm.mountPreview($area);

        close();
      }
      function cancel() {
        close();
      }
      function close() {
        component.$off("configured");
        component.$off("cancel");
        vm.closeDialog();
      }
      component.$on("configured", configure);
      component.$on("cancel", cancel);

      component.$mountOnChild(container);

      if (component.$options.name === "DefaultWidgetConfigurator") {
        configure();
      } else vm.openDialog();
    },
    mountPreview(area) {
      let vm = this;
      let widget = this.$widgets.get(area.widget);

      let component = this.$loadComponent(widget.preview, {
        propsData: {
          ...area.props,
        },
      });
      let previewContainer = vm.$refs["preview_" + area.id];
      vm.activeAreas.push(area.id);
      component.$mountOnChild(previewContainer);
    },
    openDialog() {
      this.widgetConfigDialog = true;
    },
    closeDialog() {
      this.widgetConfigDialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.gridSlot {
  position: relative;
  height: 100%;
  width: 100%;
  .delBtn {
    z-index: 10;
  }
  .widgetConfigButtonWrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .previewWrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    > * {
      height: 100%;
    }
  }
}
.widgetConfig {
  width: 100%;
  > * {
    height: 100%;
    width: 100%;
  }
}
</style>
