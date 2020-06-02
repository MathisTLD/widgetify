<template>
  <div :style="{ height, width }" class="GridTemplateGenerator">
    <div>
      <slot name="controls" :rows="nRow" :columns="nCol">
        <div class="gridControls">
          rows : <input v-model.number="nRow" type="number" class="nbInput" />
          columns :
          <input v-model.number="nCol" type="number" class="nbInput" />
        </div>
      </slot>
    </div>
    <div
      class="grid"
      :style="{
        'grid-template-rows': cssTemplate.rows,
        'grid-template-columns': cssTemplate.columns
      }"
      @mouseup="endSelection()"
    >
      <div
        v-for="cell in cells"
        class="cell"
        :key="cell.id"
        :style="{ gridArea: cell.area.join(' / ') }"
        @mousedown="startSelection(cell)"
        @mouseover="hoveredCell = cell"
        @mouseleave="hoveredCell = null"
      >
        <slot name="cell" :id="cell.id"></slot>
      </div>

      <div
        v-for="area in areas"
        :key="area.id"
        class="area"
        :style="{ gridArea: area.area.join(' / ') }"
      >
        <slot name="area" :id="area.id" :actions="{ deleteArea }"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import _min from "lodash/min";
import _max from "lodash/max";
import _cloneDeep from "lodash/cloneDeep";

export default {
  props: {
    height: {
      default: "100%"
    },
    width: {
      default: "100%"
    },
    init: {
      type: Object,
      default: () => ({
        areas: [
          [".", "."],
          [".", "."]
        ],
        rows: ["1fr", "1fr"],
        columns: ["1fr", "1fr"]
      })
    }
  },
  data() {
    return {
      areas: [],
      createdAreas: 0,
      rows: [],
      nRow: 0,
      columns: [],
      nCol: 0,
      hoveredCell: null
    };
  },
  computed: {
    template() {
      let { areas, rows, columns } = this;
      let row = Array.from(Array(columns.length), () => ".");
      let layout = Array.from(Array(rows.length), () => _cloneDeep(row));
      areas.forEach(area => {
        let [a, b, c, d] = area.area;
        for (let y = a; y < c; y++) {
          for (let x = b; x < d; x++) {
            layout[y - 1][x - 1] = area.id;
          }
        }
      });
      return { areas, layout, rows, columns };
    },
    cssTemplate() {
      return this.templateToCss(this.template);
    },
    cells() {
      let cells = [];
      let columns = this.columns;
      this.rows.forEach((r, y) => {
        columns.forEach((c, x) => {
          let col = x + 1;
          let row = y + 1;
          cells.push({
            id: row + "" + col,
            area: [row, col, row + 1, col + 1]
          });
        });
      });
      return cells;
    },
    hash() {
      return this.cssTemplate.areas;
    }
  },
  watch: {
    hash() {
      this.updateTemplate();
    },
    hoveredCell(cell) {
      if (cell) {
        this.$emit("hovering-cell", cell);
      }
    },
    nRow() {
      this.setGridLayout();
    },
    nCol() {
      this.setGridLayout();
    }
  },
  methods: {
    deleteArea(id) {
      this.areas = this.areas.filter(area => area.id != id);
    },
    startSelection(cell) {
      let layout = this.template.layout;
      this.createdAreas++;
      let id = "area_" + this.createdAreas;
      let area = { id, area: cell.area };
      this.areas.push(area);
      let onCellHover = cell => {
        let [a, b, c, d] = area.area;
        let [e, f, g, h] = cell.area;
        let newArea = [
          Math.min(a, e),
          Math.min(b, f),
          Math.max(c, g),
          Math.max(d, h)
        ];
        // check for overlap
        [a, b, c, d] = newArea;
        overlap_test: {
          for (let y = a; y < c; y++) {
            for (let x = b; x < d; x++) {
              let zone = layout[y - 1][x - 1];
              if (![area.id, "."].includes(zone)) break overlap_test;
            }
          }
          area.area = newArea;
        }
      };
      this.$on("hovering-cell", onCellHover);
    },
    endSelection() {
      // also called when deleting an area
      this.$off("hovering-cell");
    },
    setGridLayout() {
      let nRow = this.nRow;
      let nCol = this.nCol;
      let nNewRow = nRow - this.rows.length;
      let nNewCol = nCol - this.columns.length;
      if (nNewRow < 0) {
        for (let i = 0; i < -nNewRow; i++) {
          this.rows.pop();
        }
      } else {
        for (let i = 0; i < nNewRow; i++) {
          this.rows.push("1fr");
        }
      }
      if (nNewCol < 0) {
        for (let i = 0; i < -nNewCol; i++) {
          this.columns.pop();
        }
      } else {
        for (let i = 0; i < nNewCol; i++) {
          this.columns.push("1fr");
        }
      }
      // sanitize areas
      this.areas = this.areas.filter(area => {
        let [a, b, c, d] = area.area;
        if (c > nRow + 1) c = nRow + 1;
        if (d > nCol + 1) d = nCol + 1;
        area.area = [a, b, c, d];
        return a <= nRow && b <= nCol;
      });
    },
    templateToCss(template) {
      let { layout, rows, columns } = _cloneDeep(template);
      let areas = layout.map(row => '"' + row.join(" ") + '"').join(" ");
      rows = rows.join(" ");
      columns = columns.join(" ");
      return { areas, rows, columns };
    },
    updateTemplate() {
      let { layout, rows, columns } = this.template;
      this.$emit("update:template", { areas: layout, rows, columns });
    }
  },
  created() {
    let { areas, rows, columns } = this.init;
    this.rows = rows;
    this.nRow = rows.length;
    this.columns = columns;
    this.nCol = columns.length;
    let areasMap = {};

    areas.forEach((line, y) => {
      line.forEach((val, x) => {
        if (val != ".") {
          if (areasMap[val]) {
            areasMap[val].x.push(x + 1);
            areasMap[val].y.push(y + 1);
          } else {
            areasMap[val] = { id: val, x: [x + 1], y: [y + 1] };
          }
        }
      });
    });
    this.createdAreas =
      _max(Object.values(areasMap).map(a => parseFloat(a.id.split("_")[1]))) ||
      0;

    this.areas = Object.values(areasMap).map(a => {
      let { x, y } = a;
      let area = [_min(y), _min(x), _max(y) + 1, _max(x) + 1];
      return { id: a.id, area };
    });
  },
  mounted() {}
};
</script>

<style>
.GridTemplateGenerator {
  display: grid;
  grid-template-rows: max-content 1fr;
}
.grid {
  height: 100%;
  width: 100%;
  display: grid;
  padding: 10px;
  grid-gap: 10px;
}
.cell {
  background-color: #616161;
  text-align: right;
  padding: 20px;
  cursor: pointer;
  user-select: none;
}
.area {
  background-color: #212121;
  user-select: none;
  z-index: 5;
}
.gridControls {
  text-align: center;
}
input.nbInput {
  width: 25px;
}
</style>
