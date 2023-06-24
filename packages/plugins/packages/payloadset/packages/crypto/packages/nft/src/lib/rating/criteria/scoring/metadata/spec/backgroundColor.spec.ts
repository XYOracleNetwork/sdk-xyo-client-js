import { scoreBackgroundColor } from '../backgroundColor'

const valid = ['ffffff', 'FFFFFF']
const invalid = ['#ffffff', '#FFFFFF', '', undefined, null]

describe('scoreBackgroundColor', () => {
  describe('with valid color', () => {
    it.each(valid)('returns score', (color) => {
      const score = scoreBackgroundColor(color)
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).not.toBeNegative()
      expect(possible).toBeNumber()
      expect(possible).not.toBeNegative()
      expect(total).toBeLessThanOrEqual(possible)
    })
  })
  describe('with invalid color', () => {
    it.each(invalid)('returns score', (color) => {
      const score = scoreBackgroundColor(color)
      const [total, possible] = score
      expect(total).toBeNumber()
      expect(total).not.toBeNegative()
      expect(possible).toBeNumber()
      expect(possible).not.toBeNegative()
      expect(total).toBeLessThanOrEqual(possible)
    })
  })
})
