import { scoreName } from '../name'
import { expectMaxPossibleScore, expectMiniumScore } from './testHelpers.spec'

const valid = ['Foo Friends #3042', '🔥 Fire & Such']
const invalid = [{}]
const missing = ['', undefined, null]

describe('scoreName', () => {
  describe('with valid name', () => {
    it.each(valid)('returns max possible score', (value) => {
      const score = scoreName(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with missing or invalid name', () => {
    it.each([...missing, ...invalid])('returns minimum score', (value) => {
      const score = scoreName(value)
      expectMiniumScore(score)
    })
  })
})
