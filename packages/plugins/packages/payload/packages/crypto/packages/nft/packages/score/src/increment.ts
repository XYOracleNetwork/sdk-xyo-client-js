import { ScaledScore } from './score'

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
