import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

import { PayloadValuesTransformer, PayloadValueTransformer } from './PayloadValueTransformer'

export type ForecastingMethod = (payloads: XyoPayload[], transformer: PayloadValueTransformer | PayloadValuesTransformer) => Promisable<XyoPayload[]>
