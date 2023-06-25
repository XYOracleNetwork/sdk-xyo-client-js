import { PASS, ScaledScore } from '../../../../score'

export const expectMaxPossibleScore = (score: ScaledScore) => {
  const [total, possible] = score
  expect(total).toBeNumber()
  expect(total).toBePositive()
  expect(possible).toBeNumber()
  expect(possible).toBePositive()
  expect(total).toEqual(possible)
}

export const expectLoweredScore = (score: ScaledScore) => {
  const [total, possible] = score
  expect(total).toBeNumber()
  expect(total).not.toBeNegative()
  expect(possible).toBeNumber()
  expect(possible).toBePositive()
  expect(total).toBeLessThan(possible)
}

export const expectMiniumScore = (score: ScaledScore) => {
  const [total] = score
  expectLoweredScore(score)
  expect(total).toBe(0)
}

export const expectNoScore = (score: ScaledScore) => {
  expect(score).toEqual(PASS)
}
