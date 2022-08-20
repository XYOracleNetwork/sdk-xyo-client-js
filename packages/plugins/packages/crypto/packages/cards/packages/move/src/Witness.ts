import { Promisable } from '@xyo-network/promisable'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoWitnessConfig> {
  override observe(payload: XyoCryptoCardsMovePayload): Promisable<XyoCryptoCardsMovePayload> {
    return super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
