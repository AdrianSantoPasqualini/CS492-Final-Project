<template>
  <div class="robot-card">
    <div v-if="controls" class="card-buttons">
      <button v-bind:class="{ selected: friendlySelected }" v-on:click="selectedFriendly()">Friendly</button>
      <button v-bind:class="{ selected: foeSelected }" v-on:click="selectedFoe()">Enemy</button>
    </div>
    <div v-if="removeButton" class="remove-button">
      <button v-if="friendlySelected" v-on:click="selectedFriendly()">Remove</button>
      <button v-if="foeSelected" v-on:click="selectedFoe()">Remove</button>
    </div>
    <img crossorigin="" :src="this.robourl" :id="this.robohash"/>
    <p>{{robohash}}</p>
  </div>
</template>

<script>
export default {
  name: 'RobotSelectionCard',
  data() {
    return {
      robourl: '',
    }
  },
  methods: {
    selectedFriendly() {
      this.$emit('selected_friendly')
    },
    selectedFoe() {
      this.$emit('selected_foe')
    }
  },
  props: ['robohash', 'controls', 'friendlySelected', 'foeSelected', 'removeButton'],
  mounted() {
    this.robourl = 'https://robohash.org/' + this.robohash;
  }
}
</script>

<style scoped>
.robot-card {
  margin: 0.25rem;
  padding: 0.25rem;
  background: #fec8c1;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  border-radius: 5px;
}

.card-buttons {
  padding-top: 0.25rem;
  display: flex;
  justify-content: space-evenly;
}

.remove-button {
  padding-top: 0.5rem;
  padding-left: 0.5rem;
  text-align: left;
}

.selected {
  background: #fd988b;
}
</style>