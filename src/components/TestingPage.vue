<template>
  <div class="test-page-container">
    <div>
      <h1>Test How Your Training Sets Perform</h1>
      <h4>Choose an algorithm from below to run the classification with. When you press the Test button, the classification model will be trained using the datasets you have created.</h4>
      <h4>Once training is complete, the trained model will be used to predict each entry in the example datasets so you can see how your model performed.</h4>
      <h4>If your accuracy is low, try getting more training data or being more selevtive with your training data to see if you can improve it.</h4>
      <h4>Logistic regression is a basic classification algorithm which should give us decent results, but it is not the strongest tool we have.</h4>
      <h4>The MobileNet model is a more modern/powerful approach with a neural network that has pretrained parameters and weights. What we do with that model is something called transfer learning. We initialize the classification model with the pretrained weights that other data scientists have created, and we adapt them to fit our specific classification problem.</h4>
    </div>
    <div>
      <button style="margin-right: 0.5rem" v-on:click="trainAndTestLogisticRegression()">Test With Logistic Regression</button>
      <button v-on:click="trainAndTestMobileNetKNN()">Test With MobileNet Model</button>
    </div>
    <p v-if="showWarning">You must select some training data before testing.</p>
    <div v-if="doneTesting && !currentlyTesting" class="test-results">
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
    <div v-if="currentlyTesting">
      <p> Training models and testing on example cities...</p>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import * as mobilenet from '@tensorflow-models/mobilenet'
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
      currentlyTesting: false,
      doneTesting: false,
      showWarning: false,
      classifier_MobileNet_KNN: undefined,
      const_friendlyId: 1,
      const_foeId: 0,
      trainingDone: false,
    }
  },
  methods: {
    async trainAndTestMobileNetKNN() {
      if (this.friendlyHashes.length ==  0 || this.foeHashes.length == 0) {
        this.showWarning = true
        return
      }
      this.currentlyTesting = true
      await this.trainModel_MobileNet_KNN()
      await this.testModel_MobileNet_KNN()
      this.currentlyTesting = false
      this.doneTesting = true
    },
    async trainModel_MobileNet_KNN() {
      // Given an array of <img> elements and an array of corresponding labels,
      // train a KNN model using the internal representation of MobileNet as the
      // feature vector.
      const friendlyHashes = this.friendlyHashes
      const foeHashes = this.foeHashes

      // Load the model MobileNet.
      let net = await mobilenet.load()

      // Create the KNN model.
      const classifier = knnClassifier.create()

      // Add training data to the KNN set.
      // NOTE: Cannot create image object for recognition via URL. Must use existing img element.
      for (let i = 0; i < friendlyHashes.length; ++i) {
        const roboImgObj = document.getElementById(friendlyHashes[i])
        const internalRep = net.infer(roboImgObj, 'conv_preds')
        classifier.addExample(internalRep, this.const_friendlyId)
      }
      for (let i = 0; i < foeHashes.length; ++i) {
        const roboImgObj = document.getElementById(foeHashes[i])
        const internalRep = net.infer(roboImgObj, 'conv_preds')
        classifier.addExample(internalRep, this.const_foeId)
      }

      this.classifier_MobileNet_KNN = classifier
      this.trainingDone = true
    },
    async testModel_MobileNet_KNN() {
      // Run the trained model on city hashes.
      if (this.trainingDone) {
        const testFriendlyHashes = this.ExampleCities.friendly
        const testFoeHashes = this.ExampleCities.foe

        const classifier = this.classifier_MobileNet_KNN

        const resultsOnFriendly = []
        const resultsOnFoe = []

        let net = await mobilenet.load()

        for (let i = 0; i < testFriendlyHashes.length; ++i) {
          const roboImgObj = document.getElementById(testFriendlyHashes[i])
          const internalRep = net.infer(roboImgObj, 'conv_preds')
          const result = await classifier.predictClass(internalRep);
          resultsOnFriendly.push(parseInt(result.label))
        }
        for (let i = 0; i < testFoeHashes.length; ++i) {
          const roboImgObj = document.getElementById(testFoeHashes[i])
          const internalRep = net.infer(roboImgObj, 'conv_preds')
          const result = await classifier.predictClass(internalRep);
          resultsOnFoe.push(parseInt(result.label))
        }

        this.friendlyPredictions = resultsOnFriendly
        this.foePredictions = resultsOnFoe
        this.testAccuracy = ((resultsOnFriendly.reduce((a, b) => a + b, 0) + resultsOnFoe.reduce((a, b) => a + (1-b), 0)) / (resultsOnFoe.length + resultsOnFriendly.length) * 100).toFixed(2)
      }
    },
    async trainAndTestLogisticRegression() {
      if (this.friendlyHashes.length ==  0 || this.foeHashes.length == 0) {
        this.showWarning = true
        return
      }

      this.currentlyTesting = true

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

      this.currentlyTesting = false;
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