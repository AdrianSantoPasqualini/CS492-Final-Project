<template>
  <div id='landing-page-container'>
    <h1>Here are some robots:</h1>
    <div class="robots-container">
      <div v-for="robohash in this.robohashes" :key="robohash" class="robot-container">
        <robot-selection-card :robohash="robohash"/>
      </div>
    </div>
  </div>
</template>

<script>
import RobotSelectionCard from './RobotSelectionCard.vue'
export default {
  name: 'LandingPage',
  components: {
    RobotSelectionCard
  },
  data() {
    return {
      robohashes: []
    }
  },
  mounted() {
    for (let i = 0; i < 50; i++) {
      this.robohashes.push(Math.random());
    }
  }
}
</script>

<style scoped>
#landing-page-container {
  background: #fe8a71;
}

.robots-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

</style>