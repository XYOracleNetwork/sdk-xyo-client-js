import { scoreExternalUrl } from '../externalUrl'
import { expectLoweredScore, expectMaxPossibleScore, expectMiniumScore } from './testHelpers.spec'

const secure = ['https://lostpoets.xyz/']
const insecure = ['http://lvcidia.xyz/']
const invalid = ['', 'not a url', {}]
const missing = [undefined, null]

describe('scoreExternalUrl', () => {
  describe('with secure url', () => {
    it.each(secure)('returns max possible score', (value) => {
      const score = scoreExternalUrl(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with valid url', () => {
    it.each(insecure)('returns lowered score', (value) => {
      const score = scoreExternalUrl(value)
      expectLoweredScore(score)
    })
  })
  describe('with invalid url', () => {
    it.each(invalid)('returns minium score', (value) => {
      const score = scoreExternalUrl(value)
      expectMiniumScore(score)
    })
  })
  describe('with no url', () => {
    it.each(missing)('returns minimum score', (value) => {
      const score = scoreExternalUrl(value)
      expectMiniumScore(score)
    })
  })
})
