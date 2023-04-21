import { ForecastingMethod } from '@xyo-network/diviner'

import { configurableArima } from '../configurable'

export const arimaOpts: ARIMAOptions = { d: 1, p: 2, q: 2 }

export const arimaForecasting: ForecastingMethod = configurableArima(arimaOpts)
