import { XyoPayload } from '@xyo-network/payload'

import { XyoCryptoCardsGamePayloadSchema } from './Schema'

export type XyoCryptoCardsGamePayload = XyoPayload<{
  schema: XyoCryptoCardsGamePayloadSchema
  /** @field The time [epoch] when the game is no longer allowed to be joined */
  expiration: number
  /** @field The length [ms] of the game */
  duration: number
  /** @field The set of weights to pick from */
  allowedWeights: number[]
  /** @field The Huri of the Oracle Pointer that will determine the winner */
  oraclePointer: string
  /** @field The Address of the Sequencer that will be used */
  sequencer: string
  /** @field The Sequence of payloads the are required for completion */
  sequence: string[]
}>
