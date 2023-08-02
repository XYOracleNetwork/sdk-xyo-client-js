export type PassFailScore = [total: number, possible: 1]
export const PASS: PassFailScore = [1, 1]
export const FAIL: PassFailScore = [0, 1]
export type ScaledScore = [total: number, possible: number]
export const SKIP: ScaledScore = [0, 0]
export type Score = ScaledScore | PassFailScore
