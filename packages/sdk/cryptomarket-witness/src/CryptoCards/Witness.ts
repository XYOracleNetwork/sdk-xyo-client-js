import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoCryptoCardsGamePayload, XyoCryptoCardsMovePayload } from './Payload'

export class XyoCryptoCardsGameWitness extends XyoQueryWitness<XyoCryptoCardsGamePayload, XyoQueryPayload> {
  override async observe(payload: XyoCryptoCardsGamePayload): Promise<XyoCryptoCardsGamePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.cards.game'
}

export class XyoCryptoCardsMoveWitness extends XyoQueryWitness<XyoCryptoCardsMovePayload, XyoQueryPayload> {
  override async observe(payload: XyoCryptoCardsMovePayload): Promise<XyoCryptoCardsMovePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.cards.move'
}
