<template>
  <div id='landing-page-container'>
    <div class="sidebar">
      <button v-bind:class="{ selected: tabIndex == 6 }" v-on:click="changeTab(6)">Overview</button>
      <button v-bind:class="{ selected: tabIndex == 0 }" v-on:click="changeTab(0)">Friendly Example</button>
      <button v-bind:class="{ selected: tabIndex == 1 }" v-on:click="changeTab(1)">Enemy Example</button>
      <button v-bind:class="{ selected: tabIndex == 2 }" v-on:click="changeTab(2)">Get Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 3 }" v-on:click="changeTab(3)">Friendly Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 4 }" v-on:click="changeTab(4)">Enemy Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 5 }" v-on:click="changeTab(5)">Test</button>
    </div>
    <div class="sidebar-spacer">
    </div>
    <div class="main-content">
      <div class="robots-container" style="padding-left: 2.5rem; text-align: left;" v-show="tabIndex == 6">
        <h1>Overview and Motivation</h1>
        <p>Currently, most AI models fall into two categories based on how they are built - unsupervised learning, and supervised learning. For unsupervised learning models, the model designers do not encode prior knowledge about a distribution, and the models are expected to learn about the hidden pattern and structure of this distribution given a dataset drawn from it. On the other hand, for supervised learning, the designers have a clear set of categories (labels) beforehand, and the AI models are expected to be able to categorize new items into these predefined categories (labels) by learning from a dataset (training set) with its data points already categorized.</p>
        <p>In many military use cases of AI, one typical feature of these AI systems is the ability to identify targets, such as individuals, as friends or enemies. Such models underlying these AI systems would often be supervised learning models, and the corresponding labels are "friends" or "enemies". The complex nature of most AI systems, compounding with the process of extrapolation and its sensitivity to the training dataset, can lead to these AI models making unexpected classification results. In a future in which lethally autonomous weapons (a lethal weapon that has authority to choose its own targets) are widely deployed and human lives are involved, such unexpectedness may have devastating consequences.</p>
        <p>The goal of this exercise is to give you experience with the challenges developers and data scientists face when collecting training data for these problems, and to give you a sense of how difficult it is to train a perfect classifier.</p>
        <p>Use the tabs to the left to navigate around the site. You are given two example sets of robots, one representing a friendly population and one representing an enemy population. You should be able to see some broader differences between the two sets, as well as some features that have some minor overlap. You must collect training data (from the 4th tab) by selecting robots you see as being a part of the friendly population or the enemy population (or neither).</p>
        <p>Your selections will be used (in the bottom tab) to train a classification model which will be tested on the example sets you were given. You can change your training sets as many times as you like to try and increase your accuracy.</p>
        <p>As a final note, think about if you would be comfortable deploying a lethally autonomous weapon system that had the classification accuracy rate that you were able to achieve, and think about if you would be comfortable living in a place where the autonomous weapon system was deployed, even if you should be classified as friendly.</p>
        
        <p>All the robot art we used are lovingly delivered by <a  target="_blank" href="https://robohash.org/">Robohash.org</a>.</p>
      </div>
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
      <testing-page
        v-show="tabIndex == 5"
        :foeHashes="selectedFoeHashes"
        :friendlyHashes="selectedFriendlyHashes"
      />
    </div>
  </div>
</template>

<script>
import RobotSelectionCard from './RobotSelectionCard.vue';
import TestingPage from './TestingPage.vue';
import ExampleCities from './cities.js';
export default {
  name: 'LandingPage',
  components: {
    RobotSelectionCard,
    TestingPage
  },
  data() {
    return {
      robohashes: [],
      selectedFoeHashes: [],
      selectedFriendlyHashes: [],
      exampleFriendlyHashes: [],
      exampleFoeHashes: [],
      tabIndex: 6,
    }
  },
  methods: {
    changeTab(tabIndex) {
      this.tabIndex = tabIndex;
      localStorage.setItem('tabIndex', tabIndex);
    },
    selectFriendly(robohash) {
      if (!this.selectedFriendlyHashes.includes(robohash)) {
        this.selectedFriendlyHashes.push(robohash)
      } else {
        this.selectedFriendlyHashes = this.selectedFriendlyHashes.filter(hash => hash !== robohash)
      }
      localStorage.setItem('selectedFriendlyHashes', this.selectedFriendlyHashes);
    },
    selectFoe(robohash) {
      if (!this.selectedFoeHashes.includes(robohash)) {
        this.selectedFoeHashes.push(robohash)
      } else {
        this.selectedFoeHashes = this.selectedFoeHashes.filter(hash => hash !== robohash)
      }
      localStorage.setItem('selectedFoeHashes', this.selectedFoeHashes);
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
    this.selectedFriendlyHashes = localStorage.getItem('selectedFriendlyHashes').split(',')
    this.selectedFoeHashes = localStorage.getItem('selectedFoeHashes').split(',')
    this.tabIndex = parseInt(localStorage.getItem('tabIndex'));
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
  width: 100%;
}

</style>