import * as tf from '@tensorflow/tfjs'
import { smallRedCity } from './cities.js'

export const logisticRegressionClassifier = inputShape =>
  tf.sequential({
    layers: [
      tf.layers.batchNormalization({ inputShape }),
      tf.layers.dense({
        inputShape,
        units: 1,
        activation: 'sigmoid',
        useBias: true,
      }),
    ],
  })

// async
const loadImage = src => 
  new Promise ((resolve, reject) => {
    const img = new Image()
    img.onload = resolve(img) // Only resolve when image is loaded
    img.onerror = reject
    img.src = src
    img.crossOrigin = 'anonymous'
  })

const smallRobourl = robohash => `https://robohash.org/${robohash}?size=50x50`

const robohashToTensor = async robohash => {
  const img = await loadImage(smallRobourl(robohash))
  if (!img.width && !img.height) {
    // Sometimes it happens that width and height aren't set yet upon image load
    img.width = img.height = 50
  }
  const tensor = tf.browser.fromPixels(img, 4).cast('float32')
  return tensor
}

// smallRedCity.foeHashes.forEach(async robohash => {
//   const tensor = await robohashToTensor(robohash)
//   const canvas = document.createElement('canvas')
//   tf.browser.toPixels(tensor, canvas)
//   document.body.appendChild(canvas)
// })

export const prepareData = async ({ friendlyHashes, foeHashes }) => ({
  xs: tf.stack(await Promise.all(
    friendlyHashes
      .concat(foeHashes)
      .map(robohashToTensor)
  ))
    .reshape([-1, 50*50*4])
    .cast('float32'),
  ys: tf.ones([friendlyHashes.length, 1])
    .concat(tf.zeros([foeHashes.length, 1]))
    .cast('float32'),
})

const prepareToyData = () => {
  const xs = tf.randomUniform([123, 10000])
  const mids = xs.matMul(tf.randomNormal([10000, 1]))
  const ys = tf.sigmoid(mids).round()
  return { xs, ys }
}

// This is sample training code
export const testTraining = async () => {
  let logRes = logisticRegressionClassifier([10000])
  logRes.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['binaryAccuracy'],
  })

  const { xs, ys } = await prepareToyData(smallRedCity)

  await logRes.fit(xs, ys, {
    epochs: 20,
    batchSize: 123,
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
  
  console.log({
    tf,
    logRes,
    // dataset,
    smallRedCity,
    robohashToTensor,
  })
}

testTraining()
