import { Payload } from '@xyo-network/payload-model'

import { CryptoCardsGameSchema } from './Schema'

export type CryptoCardsGamePayload = Payload<{
  /** @field The set of weights to pick from */
  allowedWeights: number[]
  /** @field The length [ms] of the game */
  duration: number
  /** @field The time [epoch] when the game is no longer allowed to be joined */
  expiration: number

  /** @field The Huri of the Oracle Pointer that will determine the winner */
  oraclePointer: string
  schema: CryptoCardsGameSchema
  /** @field The Sequence of payloads the are required for completion */
  sequence: string[]
  /** @field The Address of the Sequencer that will be used */
  sequencer: string
}>
