import { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import ARIMA, { ARIMAOptions } from 'arima'

export const commonOpts: ARIMAOptions = { verbose: false }

const schema = 'network.xyo.diviner.prediction'

export type PredictionPayload = Payload<{ error?: number; value: number }>

export const configurableArima = (opts: ARIMAOptions = commonOpts, predictionSteps = 10): ForecastingMethod => {
  return (payloads: Payload[], transformer: PayloadValueTransformer): Payload[] => {
    // If there's no input, there's no prediction
    if (payloads.length === 0) return []
    // Transform all the values
    const values = payloads.map(transformer)
    // Train a model on the training set
    const model = new ARIMA({ ...commonOpts, ...opts }).train(values)
    // Use the trained model to predict the next N values
    const predictions = model.predict(predictionSteps)
    // Convert the predictions into payloads
    return predictions.map((prediction) => {
      const [value, error] = prediction
      return PayloadWrapper.parse({ error, schema, value }).payload
    })
  }
}
