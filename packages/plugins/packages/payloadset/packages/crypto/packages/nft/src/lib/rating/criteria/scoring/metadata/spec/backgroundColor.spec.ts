import { scoreBackgroundColor } from '../backgroundColor'
import { expectLoweredScore, expectMaxPossibleScore, expectNoScore } from './testHelpers'

const valid = ['ffffff', 'FFFFFF']
const invalid = ['#ffffff', '#FFFFFF', '']
const missing = [undefined, null]

describe('scoreBackgroundColor', () => {
  describe('with valid background_color', () => {
    it.each(valid)('returns max possible score', (value) => {
      const score = scoreBackgroundColor(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with invalid background_color', () => {
    it.each(invalid)('returns lowered score', (value) => {
      const score = scoreBackgroundColor(value)
      expectLoweredScore(score)
    })
  })
  describe('with missing background_color', () => {
    it.each(missing)('returns no score', (value) => {
      const score = scoreBackgroundColor(value)
      expectNoScore(score)
    })
  })
})
