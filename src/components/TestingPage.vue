<template>
  <div>
    <button v-on:click="train()">Train!</button>
    <p v-for="(epoch, epochNum) in this.epochs" :key="epoch">
      [Epoch {{ epochNum }}] Loss: {{ epoch.loss }}, Accuracy: {{ epoch.accuracy }}
    </p>
    <h1>Friendlies</h1>
    <h3>Labelled</h3>
    <img v-for="robohash in this.friendlyHashes" :key="robohash" :src="`https://robohash.org/${robohash}?size=100x100`" />
    <h3>Predictions</h3>
    <div class="prediction-results">
      <div v-for="robot in this.newFriendlies" :key="robot.robohash">
        <img :src="`https://robohash.org/${robot.robohash}?size=100x100`" />
        <p>Score: {{ robot.y.toFixed(5) }}</p>
      </div>
    </div>
    <h1>Foes</h1>
    <h3>Labelled</h3>
    <img v-for="robohash in this.foeHashes" :key="robohash" :src="`https://robohash.org/${robohash}?size=100x100`" />
    <h3>Predictions</h3>
    <div class="prediction-results">
      <div v-for="robot in this.newFoes" :key="robot.robohash">
        <img :src="`https://robohash.org/${robot.robohash}?size=100x100`" />
        <p>Score: {{ robot.y.toFixed(5) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs'
import {
  logisticRegressionClassifier,
  prepareData,
  robohashToTensor,
  predictLogRes,
  robohashesToBatchTensor,
  imgSize,
  numChannels
} from '../logisticRegression.js'
console.log(robohashToTensor)
console.log(tf)
export default {
  name: 'TestingPage',
  data() {
    return {
      newFriendlies: [],
      newFoes: [],
      epochs: [],
    }
  },
  methods: {
    async train() {
      const { xs, ys } = await prepareData({
        friendlyHashes: this.friendlyHashes,
        foeHashes: this.foeHashes,
      })

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

      const ypred = logRes.predict(xs)
      console.log('labels', await ys.reshape([-1]).array())
      console.log('raw predictions', await ypred.reshape([-1]).array())
      console.log('predictions', await ypred.round().reshape([-1]).array())
      console.log('loss', await tf.metrics.binaryCrossentropy(ys, ypred).array())
      console.log('accuracy', await tf.metrics.binaryAccuracy(ys, ypred).array())

      const newHashes = Array(100).fill().map(_ => Math.random())
      const newXs = await robohashesToBatchTensor(newHashes)
      const newYpred = await logRes.predict(newXs).flatten().array()
      const newRobots = newHashes.map((robohash, i) => ({ robohash, y: newYpred[i] }))
      this.newFriendlies = newRobots.filter(robot => robot.y > .5).sort((robotA, robotB) => robotA.y - robotB.y)
      this.newFoes = newRobots.filter(robot => robot.y <= .5).sort((robotA, robotB) => robotA.y - robotB.y)
    },
  },
  props: ['foeHashes', 'friendlyHashes'],
  mounted() {
    console.log(this.foeHashes)
  }
}
</script>

<style scoped>
.prediction-results {
  display: flex;
  flex-wrap: wrap;
}
</style>