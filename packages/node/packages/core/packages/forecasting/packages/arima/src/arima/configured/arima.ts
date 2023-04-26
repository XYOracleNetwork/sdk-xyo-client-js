import { ForecastingMethod } from '@xyo-network/forecasting-diviner-model'

import { configurableArima } from '../configurable'

export const arimaOpts: ARIMAOptions = { d: 1, p: 2, q: 2 }

export const arimaForecastingName = 'arimaForecasting'

export const arimaForecastingMethod: ForecastingMethod = configurableArima(arimaOpts)
