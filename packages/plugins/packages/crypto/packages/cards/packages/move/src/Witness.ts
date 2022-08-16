import { XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoQueryPayload> {
  override observe(payload: XyoCryptoCardsMovePayload): Promisable<XyoCryptoCardsMovePayload> {
    return {
      ...payload,
      timestamp: Date.now(),
    }
  }
}
