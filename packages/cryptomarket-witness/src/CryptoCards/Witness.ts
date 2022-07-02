import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoQueryWitness } from '@xyo-network/witnesses'

import { XyoCryptoCardsGamePayload, XyoCryptoCardsMovePayload } from './Payload'

export class XyoCryptoCardsGameWitness extends XyoQueryWitness<XyoQueryPayload, XyoCryptoCardsGamePayload> {
  constructor(query: XyoQueryPayload) {
    super({
      targetSchema: XyoCryptoCardsGameWitness.schema,
      ...query,
    })
  }

  override async observe(payload: XyoCryptoCardsGamePayload): Promise<XyoCryptoCardsGamePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.cards.game'
}

export class XyoCryptoCardsMoveWitness extends XyoQueryWitness<XyoQueryPayload, XyoCryptoCardsMovePayload> {
  constructor(query: XyoQueryPayload) {
    super({
      targetSchema: XyoCryptoCardsMoveWitness.schema,
      ...query,
    })
  }

  override async observe(payload: XyoCryptoCardsMovePayload): Promise<XyoCryptoCardsMovePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }

  public static schema = 'network.xyo.crypto.cards.move'
}
