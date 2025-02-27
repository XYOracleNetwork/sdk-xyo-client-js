import type { Promisable } from '@xylabs/promise'
import type { Payload } from '@xyo-network/payload-model'

import type { Forecast } from './Payload/index.ts'
import type { PayloadValueTransformer } from './PayloadValueTransformer.ts'

export type ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer) => Promisable<Forecast[]>
