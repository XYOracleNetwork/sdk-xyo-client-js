import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

export type PassFailScore = [amount: number, possible: 1]
export const PASS: PassFailScore = [1, 1]
export const FAIL: PassFailScore = [0, 1]
export type ScaledScore = [amount: number, possible: number]
export const SKIP: ScaledScore = [0, 0]
export type Score = ScaledScore | PassFailScore

export type PassFailScoringFunction = (nft: NftInfo) => PassFailScore | Promise<PassFailScore>
export type ScaledScoringFunction = (nft: NftInfo) => Score | Promise<Score>
export type ScoringFunction = PassFailScoringFunction | ScaledScoringFunction

export interface WeightedScoringCriteria {
  score: ScoringFunction
  weight: number
}
