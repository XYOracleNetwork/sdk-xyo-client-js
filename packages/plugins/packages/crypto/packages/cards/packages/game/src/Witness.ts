import { XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGamePayloadSchema } from './Schema'

export class XyoCryptoCardsGameWitness extends XyoWitness<XyoCryptoCardsGamePayload, XyoQueryPayload> {
  override observe(payload: XyoCryptoCardsGamePayload): Promisable<XyoCryptoCardsGamePayload> {
    return {
      ...payload,
      schema: XyoCryptoCardsGamePayloadSchema,
      timestamp: Date.now(),
    }
  }
}
