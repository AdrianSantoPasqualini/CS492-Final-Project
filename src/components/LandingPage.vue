<template>
  <div id='landing-page-container'>
    <div class="sidebar">
      <button v-bind:class="{ selected: tabIndex == 0 }" v-on:click="tabIndex = 0">Friendly Example</button>
      <button v-bind:class="{ selected: tabIndex == 1 }" v-on:click="tabIndex = 1">Enemy Example</button>
      <button v-bind:class="{ selected: tabIndex == 2 }" v-on:click="tabIndex = 2">Get Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 3 }" v-on:click="tabIndex = 3">Friendly Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 4 }" v-on:click="tabIndex = 4">Enemy Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 5 }" v-on:click="tabIndex = 5">Test</button>
    </div>
    <div class="sidebar-spacer">
    </div>
    <div class="main-content">
      <div class="robots-container" v-show="tabIndex == 0">
        <h1>Here are some samples from the friendly city to base your training data on:</h1>
        <div v-for="robohash in this.exampleFriendlyHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 1">
        <h1>Here are some samples from the enemy city to base your training data on:</h1>
        <div v-for="robohash in this.exampleFoeHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 2">
        <div class="top-container">
          <h1>Add images to your training data if they match the friendly or enemy samples:</h1>
          <button class="refresh-button" v-on:click="refresh()">
            <img width='25px' height='25px' src='../assets/refresh-icon.png'/>
          </button>
        </div>
        <div v-for="robohash in this.robohashes" :key="robohash" class="robot-container">
          <robot-selection-card
            v-on:selected_friendly="selectFriendly(robohash)"
            v-on:selected_foe="selectFoe(robohash)"
            :robohash="robohash"
            :friendlySelected="selectedFriendlyHashes.includes(robohash)"
            :foeSelected="selectedFoeHashes.includes(robohash)"
            :controls="true"/>
        </div>
      </div>
      <div class="robots-container" style="flex-direction: column" v-show="tabIndex == 3">
        <div class="top-container" style="flex-direction: column">
          <h1>View and edit the training data for your friendly city:</h1>
          <h2 v-if="this.selectedFriendlyHashes.length == 0">You have not selected any data yet.</h2>
        </div>
        <div class="robots-container" v-if="this.selectedFriendlyHashes.length > 0">
          <div v-for="robohash in this.selectedFriendlyHashes" :key="robohash" class="robot-container">
            <robot-selection-card
              :robohash="robohash"
              v-on:selected_friendly="selectFriendly(robohash)"
              :controls="false"
              :removeButton="true"
              :friendlySelected="true"/>
          </div>
        </div>
      </div>
      <div class="robots-container" style="flex-direction: column" v-show="tabIndex == 4">
        <div class="top-container" style="flex-direction: column">
          <h1>View and edit the training data for your enemy city:</h1>
          <h2 v-if="this.selectedFoeHashes.length == 0">You have not selected any data yet.</h2>
        </div>
        <div class="robots-container" v-if="this.selectedFoeHashes.length > 0">
          <div v-for="robohash in this.selectedFoeHashes" :key="robohash" class="robot-container">
            <robot-selection-card
              :robohash="robohash"
              v-on:selected_foe="selectFoe(robohash)"
              :controls="false"
              :removeButton="true"
              :foeSelected="true"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RobotSelectionCard from './RobotSelectionCard.vue';
import ExampleCities from './cities.js';
export default {
  name: 'LandingPage',
  components: {
    RobotSelectionCard
  },
  data() {
    return {
      robohashes: [],
      selectedFoeHashes: [],
      selectedFriendlyHashes: [],
      exampleFriendlyHashes: [],
      exampleFoeHashes: [],
      tabIndex: 0,
    }
  },
  methods: {
    selectFriendly(robohash) {
      if (!this.selectedFriendlyHashes.includes(robohash)) {
        this.selectedFriendlyHashes.push(robohash)
      } else {
        this.selectedFriendlyHashes = this.selectedFriendlyHashes.filter(hash => hash !== robohash)
      }
    },
    selectFoe(robohash) {
      if (!this.selectedFoeHashes.includes(robohash)) {
        this.selectedFoeHashes.push(robohash)
      } else {
        this.selectedFoeHashes = this.selectedFriendlyHashes.filter(hash => hash !== robohash)
      }
    },
    refresh() {
      for (let i = 0; i < 50; i++) {
        this.robohashes.push(Math.random());
      }
      setTimeout(() => {
        this.robohashes = this.robohashes.splice(50, 50);
      }, 1000)
    }
  },
  mounted() {
    this.exampleFoeHashes = ExampleCities.foe;
    this.exampleFriendlyHashes = ExampleCities.friendly;
    for (let i = 0; i < 50; i++) {
      this.robohashes.push(Math.random());
    }
  }
}
</script>

<style scoped>
#landing-page-container {
  background: #fe9c8f;
  display: flex;
}

.robots-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.sidebar-spacer {
  width: 5%;
}

.sidebar {
  position: fixed;
  display: flex;
  flex-direction: column;
  height: 97.5%;
  align-items: center;
  justify-content: space-evenly;

}

.sidebar button {
  width: 5rem;
  height: 5rem;
  padding: 0;
  border-radius: 1rem;
  border: 0.125em;
}

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px !important;
  height: 50px !important;
  margin-left: 25px;
}

.top-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected {
  background: #feb2a8;
}

.main-content {
  width: 95%;
}

</style>