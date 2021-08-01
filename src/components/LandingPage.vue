<template>
  <div id='landing-page-container'>
    <div class="sidebar">
      <button v-bind:class="{ selected: tabIndex == 0 }" v-on:click="tabIndex = 0">Friendly Example</button>
      <button v-bind:class="{ selected: tabIndex == 1 }" v-on:click="tabIndex = 1">Foe Example</button>
      <button v-bind:class="{ selected: tabIndex == 2 }" v-on:click="tabIndex = 2">Get Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 3 }" v-on:click="tabIndex = 3">Friendly Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 4 }" v-on:click="tabIndex = 4">Foe Training Data</button>
      <button v-bind:class="{ selected: tabIndex == 5 }" v-on:click="tabIndex = 5">Test</button>
    </div>
    <div class="sidebar-spacer">
    </div>
    <div class="main-content">
      <div class="robots-container" v-show="tabIndex == 0">
        <div v-for="robohash in this.exampleFriendlyHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 1">
        <div v-for="robohash in this.exampleFoeHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 2">
        <div v-for="robohash in this.robohashes" :key="robohash" class="robot-container">
          <robot-selection-card
            v-on:selected_friendly="selectFriendly(robohash)"
            v-on:selected_foe="selectFoe(robohash)"
            :robohash="robohash"
            :controls="true"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 3">
        <div v-for="robohash in this.selectedFriendlyHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
      <div class="robots-container" v-show="tabIndex == 4">
        <div v-for="robohash in this.selectedFoeHashes" :key="robohash" class="robot-container">
          <robot-selection-card
            :robohash="robohash"
            :controls="false"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import * as mobilenet from '@tensorflow-models/mobilenet'
import RobotSelectionCard from './RobotSelectionCard.vue';
import ExampleCities from './cities.js';

export default {
  name: 'LandingPage',
  components: {
    RobotSelectionCard
  },
  data() {
    return {
      const_friendlyId: 0,
      const_foeId: 1,
      robohashes: [],
      classifier_MobileNet_KNN: undefined,
      trainingDone: false,
      selectedFoeHashes: [],
      selectedFriendlyHashes: [],
      exampleFriendlyHashes: [],
      exampleFoeHashes: [],
      tabIndex: 0,
    }
  },
  methods: {
    selectFriendly(robohash) {
      // IDEA: Should only add the same hash once. No duplicates.
      this.selectedFriendlyHashes.push(robohash)
      console.log(this.friendlyHashes)
    },
    selectFoe(robohash) {
      this.selectedFoeHashes.push(robohash)
      console.log(this.foeHashes)
    },
    reset() {
      this.selectedFoeHashes = []
      this.selectedFriendlyHashes = []
      this.trainingDone = false
    },
    async trainModel_MobileNet_KNN() {
      // Given an array of <img> elements and an array of corresponding labels,
      // train a KNN model using the internal representation of MobileNet as the
      // feature vector.

      const friendlyHashes = this.selectedFriendlyHashes
      const foeHashes = this.selectedFoeHashes

      // Load the model MobileNet.
      console.log('Loading mobilenet..')
      let net = await mobilenet.load()
      console.log('Successfully loaded model')

      // Create the KNN model.
      const classifier = knnClassifier.create()

      // Add training data to the KNN set.
      // NOTE: Cannot create image object for recognition via URL. Must use existing img element.
      for (let i = 0; i < friendlyHashes.length; ++i) {
        // const roboImgObj = new Image();
        //roboImgObj.src = 'https://robohash.org/' + friendlyHashes[i]
        // roboImgObj.crossorigin = ""
        const roboImgObj = document.getElementById(friendlyHashes[i])
        const internalRep = net.infer(roboImgObj, 'conv_preds')
        // console.log(internalRep)
        classifier.addExample(internalRep, this.const_friendlyId)
      }
      for (let i = 0; i < foeHashes.length; ++i) {
        const roboImgObj = document.getElementById(foeHashes[i])
        const internalRep = net.infer(roboImgObj, 'conv_preds')
        // console.log(internalRep)
        classifier.addExample(internalRep, this.const_foeId)
      }

      this.classifier_MobileNet_KNN = classifier

      this.trainingDone = true

      console.log('Training Done')
    },
    async testModel_MobileNet_KNN() {
      // Run the trained model on city hashes.

      if (this.trainingDone) {
        const testFriendlyHashes = this.exampleFriendlyHashes
        const testFoeHashes = this.exampleFoeHashes

        const classifier = this.classifier_MobileNet_KNN

        const resultsOnFriendly = []
        const resultsOnFoe = []

        console.log('Loading mobilenet..')
        let net = await mobilenet.load()
        console.log('Successfully loaded model')

        console.log('Starting to classify the test robots')

        for (let i = 0; i < testFriendlyHashes.length; ++i) {
          // const roboImgObj = new Image();
          // roboImgObj.src = 'https://robohash.org/' + friendlyHashes[i]
          // roboImgObj.crossorigin = ""
          const roboImgObj = document.getElementById(testFriendlyHashes[i])
          const internalRep = net.infer(roboImgObj, 'conv_preds')
          const result = await classifier.predictClass(internalRep);
          resultsOnFriendly.push([testFriendlyHashes[i], result.label])
        }
        for (let i = 0; i < testFoeHashes.length; ++i) {
          // const roboImgObj = new Image();
          // roboImgObj.src = 'https://robohash.org/' + friendlyHashes[i]
          // roboImgObj.crossorigin = ""
          const roboImgObj = document.getElementById(testFoeHashes[i])
          const internalRep = net.infer(roboImgObj, 'conv_preds')
          const result = await classifier.predictClass(internalRep);
          resultsOnFoe.push([testFoeHashes[i], result.label])
        }

        console.log(resultsOnFriendly)
        console.log(resultsOnFoe)
      }
    }
  },
  mounted() {
    this.exampleFoeHashes = ExampleCities.foe;
    this.exampleFriendlyHashes = ExampleCities.friendly;
    for (let i = 0; i < 500; i++) {
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

.selected {
  background: #feb2a8;
}

.main-content {
  width: 95%;
}

</style>
