import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { PayloadValueTransformer } from './PayloadValueTransformer'

export type ForecastingMethod = (payloads: Payload[], transformers: PayloadValueTransformer[]) => Promisable<Payload[]>
