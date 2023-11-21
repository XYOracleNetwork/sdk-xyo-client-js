import { ForecastingMethod } from '@xyo-network/diviner-forecasting-model'
import { ARIMAOptions } from 'arima'

import { configurableArima } from '../configurable'

export const arimaOpts: ARIMAOptions = { d: 1, p: 2, q: 2 }

export const arimaForecastingName = 'arimaForecasting'

export const arimaForecastingMethod: ForecastingMethod = configurableArima(arimaOpts)
