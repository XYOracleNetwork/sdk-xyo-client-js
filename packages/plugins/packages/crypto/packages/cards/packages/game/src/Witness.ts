import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsGamePayload,
  {
    schema: XyoCryptoCardsGameWitnessConfigSchema
  }
>

export class XyoCryptoCardsGameWitness extends XyoWitness<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig> {
  override observe(payload: XyoCryptoCardsGamePayload): Promisable<XyoCryptoCardsGamePayload> {
    return super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
