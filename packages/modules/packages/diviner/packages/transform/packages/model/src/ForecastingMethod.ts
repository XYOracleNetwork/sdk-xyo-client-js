import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { Forecast } from './Payload'
import { PayloadValueTransformer } from './PayloadValueTransformer'

export type TransformMethod = (payloads: Payload[], transformers: PayloadValueTransformer) => Promisable<Forecast[]>
