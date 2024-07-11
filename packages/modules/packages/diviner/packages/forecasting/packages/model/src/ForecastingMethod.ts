import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

import { Forecast } from './Payload/index.js'
import { PayloadValueTransformer } from './PayloadValueTransformer.js'

export type ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer) => Promisable<Forecast[]>
