import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsMovePayload,
  {
    schema: XyoCryptoCardsMoveWitnessConfigSchema
  }
>

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig> {
  override observe(payloads: XyoCryptoCardsMovePayload[]): Promisable<XyoCryptoCardsMovePayload[]> {
    return super.observe(payloads)
  }
}
