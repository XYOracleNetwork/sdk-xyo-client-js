import { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import ARIMA, { ARIMAOptions } from 'arima'

export const commonOpts: ARIMAOptions = { verbose: false }

export type PredictionPayload = Payload<{ data: number }>

export const configurableArima = (opts: ARIMAOptions = commonOpts, predictionSteps = 10): ForecastingMethod => {
  return (payloads: Payload[], transformers: PayloadValueTransformer[]): Payload[] => {
    // If there's no input, there's no prediction
    if (payloads.length === 0 || transformers.length === 0) return []
    // Transform all the values
    const values = payloads.map((payload) => transformers.map((transformer) => transformer(payload)))
    // Convert the parallel transformed values into serial sequences to be used as training sets
    const trainingSets = Array(transformers.length)
      .fill(0)
      .map((_, index) => index)
      .map((index) => values.map((value) => value[index]))
    // Train a model on each training set
    const models = trainingSets.map((trainingSet) => {
      return new ARIMA({ ...commonOpts, ...opts }).train(trainingSet)
    })
    // Use the trained model to predict the next N values
    const predictions = models.map((model) => model.predict(predictionSteps))
    // Convert the predictions into payloads
    return predictions.map((prediction) => PayloadWrapper.parse({ data: prediction, schema: 'network.xyo.test' }).payload)
  }
}
