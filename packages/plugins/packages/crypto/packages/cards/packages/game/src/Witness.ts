import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoQueryWitness } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'

export class XyoCryptoCardsGameWitness extends XyoQueryWitness<XyoCryptoCardsGamePayload, XyoQueryPayload> {
  override async observe(payload: XyoCryptoCardsGamePayload): Promise<XyoCryptoCardsGamePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
