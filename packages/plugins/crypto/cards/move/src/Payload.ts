import { XyoPayload } from '@xyo-network/payload'

import { XyoCryptoCardsMovePayloadSchema } from './Schema'

export type XyoCryptoCardsMovePayload = XyoPayload<{
  schema: XyoCryptoCardsMovePayloadSchema
  /** @field The Huri of each of the cards you play - some are globally available */
  cards: string[]
  /** @field The moves chosen by the player */
  moves: number[]
}>
