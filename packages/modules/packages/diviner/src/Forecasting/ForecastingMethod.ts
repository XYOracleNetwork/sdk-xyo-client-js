import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type ForecastingMethod = (payloads: XyoPayload[]) => Promisable<XyoPayload[]>
