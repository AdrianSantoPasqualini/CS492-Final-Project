<template>
  <div class="robot-card">
    <div v-if="controls" class="card-buttons">
      <button v-on:click="selectedFriendly()">Friendly</button>
      <button v-on:click="selectedFoe()">Foe</button>
    </div>
    <img :src="this.robourl"/>
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
  props: ['robohash', 'controls'],
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
</style>