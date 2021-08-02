<template>
  <div class="test-page-container">
    <div>
      <h1>Test How Your Training Sets Perform</h1>
      <h4>Choose an algorithm from below to run the classification with. When you press the Test button, the classification model will be trained using the datasets you have created.</h4>
      <h4>Once training is complete, the trained model will be used to predict each entry in the example datasets so you can see how your model performed.</h4>
      <h4>If your accuracy is low, try getting more training data or being more selevtive with your training data to see if you can improve it.</h4>
    </div>
    <button v-on:click="train()">Test</button>
    <p v-if="showWarning">You must select some training data before testing.</p>
    <div v-if="doneTesting" class="test-results">
      <h2>The model predicted {{ testAccuracy }}% of the robots correctly.</h2>
      <h4>See below for more detailed results. A green background means that the robot was correctly classified and a red background means it was incorrectly classified.</h4>
      <h2>Results for Friendly City:</h2>
      <div class="prediction-results">
        <div v-for="(friendlyHash, i) in ExampleCities.friendly" :key="friendlyHash">
          <img v-bind:class="{ predictionResult: true, predCorrect: friendlyPredictions[i] == 1, predIncorrect: friendlyPredictions[i] != 1 }" :src="`https://robohash.org/${friendlyHash}?size=100x100`" />
        </div>
      </div>
      <h2>Results for Enemy City:</h2>
      <div class="prediction-results">
        <div v-for="(foeHash, i) in ExampleCities.foe" :key="foeHash">
          <img v-bind:class="{ predictionResult: true, predCorrect: foePredictions[i] == 0, predIncorrect: foePredictions[i] != 0 }" :src="`https://robohash.org/${foeHash}?size=100x100`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import {
  logisticRegressionClassifier,
  prepareData,
  imgSize,
  numChannels
} from '../logisticRegression.js'

import ExampleCities from './cities.js';

export default {
  name: 'TestingPage',
  data() {
    return {
      newFriendlies: [],
      newFoes: [],
      epochs: [],
      testAccuracy: 0,
      ExampleCities: ExampleCities,
      friendlyPredictions: [],
      foePredictions: [],
      doneTesting: false,
      showWarning: false,
    }
  },
  methods: {
    async train() {
      if (this.friendlyHashes.length ==  0 || this.foeHashes.length == 0) {
        this.showWarning = true
        return
      }

      // Prepare training data
      const { xs, ys } = await prepareData({
        friendlyHashes: this.friendlyHashes,
        foeHashes: this.foeHashes,
      })

      // Load and train logistic regression model
      let logRes = logisticRegressionClassifier([imgSize*imgSize*numChannels])
      logRes.compile({
        optimizer: tf.train.adam(),
        loss: 'binaryCrossentropy',
        metrics: ['binaryAccuracy'],
      })
      await logRes.fit(xs, ys, {
        epochs: 20,
        callbacks:  {
          onEpochEnd: (epochNum, logs) => {
            this.epochs[epochNum] = {
              loss: logs.loss,
              accuracy: logs.binaryAccuracy,
            }
          },
        },
      })

      // Prepare testing data
      const { xs: xTest, ys: yTest } = await prepareData({
        friendlyHashes: ExampleCities.friendly,
        foeHashes: ExampleCities.foe,
      })

      // Test and save results
      const ypred = logRes.predict(xTest)
      let testAccuracy = await tf.metrics.binaryAccuracy(yTest, ypred).array()
      let predictions = await ypred.round().reshape([-1]).array()
      this.friendlyPredictions = predictions.splice(0, ExampleCities.friendly.length)
      this.foePredictions = predictions
      this.testAccuracy = (testAccuracy.reduce((a, b) => a + b, 0) / testAccuracy.length * 100).toFixed(2)

      this.doneTesting = true;
    },
  },
  props: ['foeHashes', 'friendlyHashes'],
}
</script>

<style scoped>
.test-page-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  padding-left: 2rem;
}

.test-results {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.predictionResult {
  margin: 0.5rem;
  border-radius: 5px;
}

.predCorrect {
  background: rgb(100, 255, 100);
}

.predIncorrect {
  background: rgb(255, 0, 0);
}

.prediction-results {
  display: flex;
  flex-wrap: wrap;
}
</style>