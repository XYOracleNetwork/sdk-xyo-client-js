import { PASS } from '../../../../score'
import { scoreBackgroundColor } from '../backgroundColor'

const valid = ['ffffff', 'FFFFFF']
const invalid = ['#ffffff', '#FFFFFF', '']
const missing = [undefined, null]

describe('scoreBackgroundColor', () => {
  describe('with valid background_color', () => {
    it.each(valid)('returns max possible score', (color) => {
      const score = scoreBackgroundColor(color)
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).toBePositive()
      expect(possible).toBeNumber()
      expect(possible).toBePositive()
      expect(total).toEqual(possible)
    })
  })
  describe('with invalid background_color', () => {
    it.each(invalid)('returns lowered score', (color) => {
      const score = scoreBackgroundColor(color)
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).not.toBeNegative()
      expect(possible).toBeNumber()
      expect(possible).toBePositive()
      expect(total).toBeLessThan(possible)
    })
  })
  describe('with missing background_color', () => {
    it.each(missing)('returns no score', (color) => {
      const score = scoreBackgroundColor(color)
      expect(score).toEqual(PASS)
    })
  })
})
