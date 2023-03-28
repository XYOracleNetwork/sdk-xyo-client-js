import { BatchSetIterator } from '../BatchSetIterator'

describe('BatchIterator', () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const additional = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  describe('addValues', () => {
    it('Adds values in bulk', () => {
      const iterator = new BatchSetIterator(values, values.length)
      iterator.addValues(additional)
    })
    it('Supports addition while iterating', () => {
      const batchSize = values.length / 2
      const iterator = new BatchSetIterator(values, batchSize)

      const result1 = iterator.next()
      expect(result1.value).toEqual(values.slice(0, batchSize))
      expect(result1.done).toBe(false)

      iterator.addValues(additional)

      const result2 = iterator.next()
      expect(result2.value).toEqual(values.slice(batchSize))
      expect(result2.done).toBe(false)

      iterator.addValues(additional)

      const result3 = iterator.next()
      expect(result3.value).toEqual(additional.slice(0, batchSize))
      expect(result3.done).toBe(false)

      const result4 = iterator.next()
      expect(result4.value).toEqual(additional.slice(batchSize))
      expect(result4.done).toBe(false)
    })
  })
  describe('next', () => {
    it.each([1, 3, 5, 10])('Gets values in bulk according to the batch size', (batchSize) => {
      const iterator = new BatchSetIterator(values, batchSize)
      for (let i = 0; i < 20; i++) {
        const result = iterator.next()
        expect(result.value.length).toBeLessThanOrEqual(batchSize)
        expect(result.done).toBe(false)
      }
    })
    it('Overflows back to the beginning', () => {
      const iterator = new BatchSetIterator(values, values.length)
      iterator.addValues(additional)

      const result1 = iterator.next()
      expect(result1.value).toEqual(values)
      expect(result1.done).toBe(false)

      const result2 = iterator.next()
      expect(result2.value).toEqual(additional)
      expect(result2.done).toBe(false)

      const result3 = iterator.next()
      expect(result3.value).toEqual(values)
      expect(result3.done).toBe(false)

      const result4 = iterator.next()
      expect(result4.value).toEqual(additional)
      expect(result4.done).toBe(false)
    })
    it('Handles empty values', () => {
      const iterator = new BatchSetIterator([], values.length)

      const result1 = iterator.next()
      expect(result1.value).toEqual([])
      expect(result1.done).toBe(true)
    })
    it('Works with for-of loop', () => {
      const batchSize = values.length / 2
      const maxIterations = 5
      const iterator = new BatchSetIterator(values, batchSize)
      let iterations = 0
      for (const batch of iterator) {
        expect(batch).toBeArray()
        expect(batch.length).toBe(batchSize)
        iterations++
        if (iterations > maxIterations) break
      }
    })
  })
})
