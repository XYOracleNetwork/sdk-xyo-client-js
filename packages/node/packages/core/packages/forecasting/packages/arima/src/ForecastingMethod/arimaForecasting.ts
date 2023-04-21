import { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import ARIMA, { ARIMAOptions } from 'arima'

const opts: ARIMAOptions = { d: 1, p: 1, q: 1, verbose: false }

export const arimaForecasting: ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer[]) => {
  const values = payloads.map((payload) => transformers.map((transformer) => transformer(payload)))
  if (!values.length) return []
  const models = values.map((trainingSet) => {
    return new ARIMA(opts).train(trainingSet)
  })
  const predictions = models.map((model) => model.predict(1))
  return predictions.map((prediction) => PayloadWrapper.parse({ data: prediction, schema: 'network.xyo.test' }))
}
