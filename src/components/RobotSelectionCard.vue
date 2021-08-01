<template>
  <div class="robot-card">
    <img crossorigin="" :src="this.robourl" :id="this.robohash"/>
    <button v-on:click="selectedFriendly()">Friendly</button>
    <button v-on:click="selectedFoe()">Foe</button>
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
  props: ['robohash'],
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
</style>
