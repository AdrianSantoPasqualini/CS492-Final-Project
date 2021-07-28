<template>
  <div id='landing-page-container'>
    <h1>Here are some robots:</h1>
    <div class="robots-container">
      <div v-for="robohash in this.robohashes" :key="robohash" class="robot-container">
        <robot-selection-card 
          v-on:selected_friendly="selectFriendly(robohash)" 
          v-on:selected_foe="selectFoe(robohash)" 
          :robohash="robohash"/>
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
      robohashes: [],
      foeHashes: [],
      friendlyHashes: [],
    }
  },
  methods: {
    selectFriendly(robohash) {
      this.friendlyHashes.push(robohash)
    },
    selectFoe(robohash) {
      this.foeHashes.push(robohash)
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
  background: #fe9c8f;
}

.robots-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

</style>