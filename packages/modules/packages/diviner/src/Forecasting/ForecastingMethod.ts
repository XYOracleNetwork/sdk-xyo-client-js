import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { PayloadValueTransformer } from './PayloadValueTransformer'

export type ForecastingMethod = (payloads: XyoPayload[], transformer: PayloadValueTransformer) => Promisable<XyoPayload[]>
