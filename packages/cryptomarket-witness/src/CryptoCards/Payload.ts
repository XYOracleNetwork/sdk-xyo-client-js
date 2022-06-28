import { XyoPayload } from '@xyo-network/payload'

export type XyoCryptoCardsGamePayload = XyoPayload<{
  /** @field The time [epoch] when the game is no longer allowed to be joined */
  expiration: number
  /** @field The length [ms] of the game */
  duration: number
  /** @field The set of weights to pick from */
  allowedWeights: number[]
  /** @field The Huri of the Oracle that will determine the winner */
  oracle: string
  /** @field The Address of the Sequencer that will be used */
  sequencer: string
}>

export type XyoCryptoCardsMovePayload = XyoPayload<{
  /** @field The Huri of each of the cards you play - some are globally available */
  cards: string[]
  /** @field The moves chosen by the player */
  moves: number[]
}>
