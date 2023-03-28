import { BatchIterator } from '../BatchIterator'

describe('BatchIterator', () => {
  describe('addValues', () => {
    it('Adds values in bulk', () => {
      const sut = new BatchIterator([], 1)
    })
    it('Removes duplicates items in bulk', () => {
      // TODO
    })
  })
  describe('next', () => {
    it('Gets values in bulk', () => {
      // TODO
    })
    it('Overflows back to the beginning', () => {
      // TODO
    })
  })
})
