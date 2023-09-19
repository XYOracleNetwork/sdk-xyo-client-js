import { scoreYoutubeUrl } from '../youtubeUrl'
import { expectLoweredScore, expectMaxPossibleScore, expectMiniumScore, expectNoScore } from './testHelpers.spec'

const secure = ['https://lostpoets.xyz/']
const insecure = ['http://lvcidia.xyz/']
const invalid = ['', 'not a url', {}]
const missing = [undefined, null]

describe('scoreYoutubeUrl', () => {
  describe('with secure url', () => {
    it.each(secure)('returns max possible score', (value) => {
      const score = scoreYoutubeUrl(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with valid url', () => {
    it.each(insecure)('returns lowered score', (value) => {
      const score = scoreYoutubeUrl(value)
      expectLoweredScore(score)
    })
  })
  describe('with invalid url', () => {
    it.each(invalid)('returns minium score', (value) => {
      const score = scoreYoutubeUrl(value)
      expectMiniumScore(score)
    })
  })
  describe('with no url', () => {
    it.each(missing)('returns no score', (value) => {
      const score = scoreYoutubeUrl(value)
      expectNoScore(score)
    })
  })
})
