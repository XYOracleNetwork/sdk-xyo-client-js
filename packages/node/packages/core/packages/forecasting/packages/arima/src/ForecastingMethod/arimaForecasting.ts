import { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { ARIMA } from 'arima'

export const arimaForecasting: ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer[]) => {
  const values = payloads.map((payload) => transformers.map((transformer) => transformer(payload)))
  if (!values.length) return []
  const models = values.map((dataPoints) => {
    // Create an ARIMA model with a differencing order of 1
    return new ARIMA({ d: 1, data: dataPoints, p: 1, q: 1 })
  })
  const predictions = models.map((model) => model.predict(1))
  return predictions.map((prediction) => PayloadWrapper.parse({ data: prediction, schema: 'network.xyo.test' }))
}
