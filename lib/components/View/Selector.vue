<template>
  <v-list-group
    v-model="showViews"
    prepend-icon="fa-th-large"
    active-class="not-active-list-item"
  >
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title>Views</v-list-item-title>
      </v-list-item-content>
    </template>
    <v-list flat dense>
      <template v-for="view in viewsArray">
        <v-list-item :key="view.id" @click="triggerSelect(view.id)">
          <v-list-item-content>
            <v-list-item-title>{{ view.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-list-group>
</template>

<script>
export default {
  data() {
    return {
      showViews: false,
    };
  },
  computed: {
    views() {
      return this.$views;
    },
    viewsArray() {
      return this.views.array;
    },
    active() {
      return this.views.array[0].id;
    },
  },
  methods: {
    triggerSelect(id) {
      this.$emit("select", id);
    },
  },
};
</script>
