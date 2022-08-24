import { Promisable } from '@xyo-network/promisable'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGamePayloadSchema, XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsGamePayload,
  {
    schema: XyoCryptoCardsGameWitnessConfigSchema
    targetSchema: XyoCryptoCardsGamePayloadSchema
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
