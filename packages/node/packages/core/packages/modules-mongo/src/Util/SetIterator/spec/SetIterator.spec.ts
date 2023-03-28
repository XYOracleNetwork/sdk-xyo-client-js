import { SetIterator } from '../SetIterator'

describe('SetIterator', () => {
  const values = [0, 1]
  const additional = [2, 3]
  describe('addValues', () => {
    it('Adds values in bulk', () => {
      const iterator = new SetIterator(values)
      iterator.addValues(additional)
    })
    it('Supports addition while iterating', () => {
      const iterator = new SetIterator(values)

      const result1 = iterator.next()
      expect(result1.value).toEqual(values[0])
      expect(result1.done).toBe(false)

      iterator.addValues(additional)

      const result2 = iterator.next()
      expect(result2.value).toEqual(values[1])
      expect(result2.done).toBe(false)

      iterator.addValues(additional)

      const result3 = iterator.next()
      expect(result3.value).toEqual(additional[0])
      expect(result3.done).toBe(false)

      const result4 = iterator.next()
      expect(result4.value).toEqual(additional[1])
      expect(result4.done).toBe(false)

      const result5 = iterator.next()
      expect(result5.value).toEqual(values[0])
      expect(result5.done).toBe(false)

      const result6 = iterator.next()
      expect(result6.value).toEqual(values[1])
      expect(result6.done).toBe(false)
    })
  })
  describe('next', () => {
    it('Overflows back to the beginning', () => {
      const iterator = new SetIterator(values)
      for (let i = 0; i < values.length; i++) {
        const result = iterator.next()
        expect(result.value).toEqual(values[i])
        expect(result.done).toBe(false)
      }
      const result = iterator.next()
      expect(result.value).toEqual(values[0])
      expect(result.done).toBe(false)
    })
    it('Handles empty values', () => {
      const iterator = new SetIterator([])
      const result1 = iterator.next()
      expect(result1.value).toBeUndefined()
      expect(result1.done).toBe(true)
    })
    it('Works with for-of loop', () => {
      const maxIterations = values.length * 3
      const iterator = new SetIterator(values)
      let iterations = 0
      for (const batch of iterator) {
        expect(batch).toBeNumber()
        iterations++
        if (iterations > maxIterations) break
      }
    })
  })
})
