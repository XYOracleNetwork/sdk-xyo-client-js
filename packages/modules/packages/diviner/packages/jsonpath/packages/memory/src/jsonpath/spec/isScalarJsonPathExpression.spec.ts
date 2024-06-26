import { isScalarJsonPathExpression } from '../isScalarJsonPathExpression'

describe('isScalarJsonPathExpression', () => {
  describe('should return true for scalar values', () => {
    const values = ['$.store', '$.store.book[0]', '$.store.book.title']
    it.each(values)('%s', (value) => {
      expect(isScalarJsonPathExpression(value)).toBeTruthy()
    })
  })
  describe('should return false for array values', () => {
    const values = ['$.store.book[*]', '$.store..price', '$.store.book[0,1]', '$.store.book[0:2]']
    it.each(values)('%s', (value) => {
      expect(isScalarJsonPathExpression(value)).toBeFalsy()
    })
  })
})
