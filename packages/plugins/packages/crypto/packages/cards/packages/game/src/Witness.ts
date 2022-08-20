import { Promisable } from '@xyo-network/promisable'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'

export class XyoCryptoCardsGameWitness extends XyoWitness<XyoCryptoCardsGamePayload> {
  override observe(payload: XyoCryptoCardsGamePayload): Promisable<XyoCryptoCardsGamePayload> {
    return super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
