import { ForecastingMethod } from '@xyo-network/diviner'

import { configurableArima } from '../configurable'

export const seasonalArimaOpts: ARIMAOptions = { D: 0, P: 1, Q: 1, d: 1, p: 2, q: 2, s: 12 }

export const seasonalArimaForecasting: ForecastingMethod = configurableArima(seasonalArimaOpts)
