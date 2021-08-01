<template>
  <div id='landing-page-container'>
    <h1>Here are some robots:</h1>
    <div class="ai-builder">
      <button v-on:click="trainModel_MobileNet_KNN()">Train Model</button>
      <button v-on:click="testModel_MobileNet_KNN()">Test Model</button>
      <button v-on:click="reset()">Reset</button>
    </div>
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
import * as tf from '@tensorflow/tfjs'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import * as mobilenet from '@tensorflow-models/mobilenet'
import RobotSelectionCard from './RobotSelectionCard.vue'
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
      foeHashes: [],
      testHashes: [],
      friendlyHashes: [],
      classifier_MobileNet_KNN: undefined,
      trainingDone: false
    }
  },
  methods: {
    selectFriendly(robohash) {
      // IDEA: Should only add the same hash once. No duplicates.
      this.friendlyHashes.push(robohash)
      console.log(this.friendlyHashes)
    },
    selectFoe(robohash) {
      this.foeHashes.push(robohash)
      console.log(this.foeHashes)
    },
    reset() {
      this.foeHashes = []
      this.friendlyHashes = []
      this.trainingDone = false
    },
    async trainModel_MobileNet_KNN() {
      // Given an array of <img> elements and an array of corresponding labels,
      // train a KNN model using the internal representation of MobileNet as the
      // feature vector.

      const friendlyHashes = this.friendlyHashes
      const foeHashes = this.foeHashes

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
        this.testHashes = this.robohashes

        const classifier = this.classifier_MobileNet_KNN
        const testHashes = this.testHashes

        const results = []

        console.log('Loading mobilenet..')
        let net = await mobilenet.load()
        console.log('Successfully loaded model')

        console.log('Starting to classify the test robots')

        for (let i = 0; i < testHashes.length; ++i) {
          // const roboImgObj = new Image();
          // roboImgObj.src = 'https://robohash.org/' + friendlyHashes[i]
          // roboImgObj.crossorigin = ""
          const roboImgObj = document.getElementById(testHashes[i])
          const internalRep = net.infer(roboImgObj, 'conv_preds')
          const result = await classifier.predictClass(internalRep);
          results.push([testHashes[i], result.label])
        }

        console.log(results)

      }
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
