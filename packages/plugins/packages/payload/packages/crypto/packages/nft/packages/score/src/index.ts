import { EmptyPayload } from '@xyo-network/payload'

export type PassFailScore = [total: number, possible: 1]
export const PASS: PassFailScore = [1, 1]
export const FAIL: PassFailScore = [0, 1]
export type ScaledScore = [total: number, possible: number]
export const SKIP: ScaledScore = [0, 0]
export type Score = ScaledScore | PassFailScore

export type PassFailScoringFunction<T extends EmptyPayload = EmptyPayload> = (payload: T) => PassFailScore | Promise<PassFailScore>
export type ScaledScoringFunction<T extends EmptyPayload = EmptyPayload> = (payload: T) => Score | Promise<Score>
export type ScoringFunction<T extends EmptyPayload = EmptyPayload> = PassFailScoringFunction<T> | ScaledScoringFunction<T>

export interface WeightedScoringCriteria<T extends EmptyPayload = EmptyPayload> {
  score: ScoringFunction<T>
  weight: number
}

export const incrementTotal = (score: ScaledScore, by = 1): ScaledScore => {
  score[0] += by
  return score
}

export const incrementPossible = (score: ScaledScore, by = 1): ScaledScore => {
  score[1] += by
  return score
}

export const incrementTotalAndPossible = (score: ScaledScore, totalBy = 1, possibleBy = 1): ScaledScore => {
  score[0] += totalBy
  score[1] += possibleBy
  return score
}
