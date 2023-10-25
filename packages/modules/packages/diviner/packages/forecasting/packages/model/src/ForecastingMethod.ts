import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

import { Forecast } from './Payload'
import { PayloadValueTransformer } from './PayloadValueTransformer'

export type ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer) => Promisable<Forecast[]>
