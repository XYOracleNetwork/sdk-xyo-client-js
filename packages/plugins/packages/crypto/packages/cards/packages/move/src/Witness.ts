import { Promisable } from '@xyo-network/promisable'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMovePayloadSchema, XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<XyoCryptoCardsMovePayloadSchema, { schema: XyoCryptoCardsMoveWitnessConfigSchema }>

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig> {
  override observe(payload: XyoCryptoCardsMovePayload): Promisable<XyoCryptoCardsMovePayload> {
    return super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
