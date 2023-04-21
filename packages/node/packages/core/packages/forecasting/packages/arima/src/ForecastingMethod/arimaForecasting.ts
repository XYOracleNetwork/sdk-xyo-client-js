import { ForecastingMethod, PayloadValueTransformer } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload-model'
import { ARIMA } from 'arima'

export const arimaForecasting: ForecastingMethod = (payloads: XyoPayload[], transformer: PayloadValueTransformer) => {
  // Input array of 10 data points
  const dataPoints: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // Create an ARIMA model with a differencing order of 1
  const arima = new ARIMA({ d: 1, data: dataPoints, p: 1, q: 1 })

  // Forecast the next value
  const nextValue = arima.predict(1)

  return []
}
