import * as tf from '@tensorflow/tfjs'
import { smallRedCity } from './cities.js'

export const logisticRegressionClassifier = inputShape =>
  tf.sequential({
    layers: [
      tf.layers.layerNormalization({ inputShape }),
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        kernelRegularizer: tf.regularizers.l1({ l1: .005 }),
      }),
    ],
  })

// async, waits for the onload event
const loadImage = src => 
  new Promise ((resolve, reject) => {
    const img = new Image()
    img.onload = resolve(img) // Only resolve when image is loaded
    img.onerror = reject
    img.src = src
    img.crossOrigin = 'anonymous'
  })

export const imgSize = 50
export const numChannels = 4

const smallRobourl = robohash => `https://robohash.org/${robohash}?size=${imgSize}x${imgSize}`

const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

const isAllZeros = async x => {
  const truthTensor = tf.all(tf.equal(x, tf.zerosLike(x)))
  return (await truthTensor.buffer()).get(0) == 1
}

export const robohashToTensor = async robohash => {
  const url = smallRobourl(robohash)
  const img = await loadImage(url)
  if (!img.width && !img.height) {
    // Sometimes it happens that width and height aren't set yet upon image load
    img.width = img.height = imgSize
  }
  const maxTries = 14
  let sleepDurationMs = 10
  let tensor
  for (let i = 0; i < maxTries; i++) {
    await sleep(sleepDurationMs)
    sleepDurationMs *= 2
    tensor = tf.browser.fromPixels(img, numChannels).cast('float32')
    if (!await isAllZeros(tensor)) {
      console.log('Tensor loaded! retries:', i)
      return tensor
    }
  }
  console.warn(`Loading from this image (from ${url}) keeps producing zero tensors!`, img)
  return tensor
}
// async
export const robohashesToBatchTensor = robohashes =>
  Promise.all(robohashes.map(robohashToTensor))
    .then(tf.stack)
    .then(xs => xs.reshape([-1, imgSize*imgSize*numChannels]))

export const prepareData = async ({ friendlyHashes, foeHashes }) => ({
  xs: tf.stack(await Promise.all(
    friendlyHashes
      .concat(foeHashes)
      .map(robohashToTensor)
  ))
    .reshape([-1, imgSize*imgSize*numChannels])
    .cast('float32'),
  ys: tf.ones([friendlyHashes.length, 1])
    .concat(tf.zeros([foeHashes.length, 1]))
    .cast('float32'),
})

const prepareToyData = () => {
  const xs = tf.randomUniform([123, imgSize*imgSize*numChannels])
  const mids = xs.matMul(tf.randomNormal([imgSize*imgSize*numChannels, 1]))
  const ys = tf.sigmoid(mids).round()
  return { xs, ys }
}

// This is sample training code
export const testTraining = async () => {
  let logRes = logisticRegressionClassifier([imgSize*imgSize*numChannels])
  logRes.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['binaryAccuracy'],
  })

  const { xs, ys } = await prepareToyData(smallRedCity)

  await logRes.fit(xs, ys, {
    validationSplit: .2,
    epochs: 20,
    callbacks:  {
      onEpochBegin: (epoch, logs) => console.log(`Epoch ${epoch}`),
      onEpochEnd: (epoch, logs) => {
        console.log('loss:', logs.loss)
        console.log('accuracy:', logs.binaryAccuracy)
      },
    },
  })

  const ypred = logRes.predict(xs)
  console.log('labels', await ys.reshape([-1]).array())
  console.log('raw predictions', await ypred.reshape([-1]).array())
  console.log('predictions', await ypred.round().reshape([-1]).array())
  console.log('loss', await tf.metrics.binaryCrossentropy(ys, ypred).array())
  console.log('accuracy', await tf.metrics.binaryAccuracy(ys, ypred).array())
}
