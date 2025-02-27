import { ForecastingMethod } from '@xyo-network/diviner-forecasting-model'
import { ARIMAOptions } from 'arima'

import { configurableArima } from '../configurable/index.ts'

export const seasonalArimaOpts: ARIMAOptions = {
  D: 0, P: 1, Q: 1, d: 1, p: 2, q: 2, s: 12,
}

export const seasonalArimaForecastingName = 'seasonalArimaForecasting'

export const seasonalArimaForecastingMethod: ForecastingMethod = configurableArima(seasonalArimaOpts)
