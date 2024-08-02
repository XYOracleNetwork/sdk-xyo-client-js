import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

import { Forecast } from './Payload/index.ts'
import { PayloadValueTransformer } from './PayloadValueTransformer.ts'

export type ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer) => Promisable<Forecast[]>
