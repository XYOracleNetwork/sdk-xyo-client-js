import { scoreAnimationUrl } from '../animationUrl'
import { expectLoweredScore, expectMaxPossibleScore, expectNoScore } from './testHelpers.spec'

const web3Urls = ['ipfs://QmaXTuWjEbDuvcA3dHypqHfxMzDLq78Zj5kBLN4JdMEYDB/3.mp4', 'ipfs://QmTxDYfccVVWoucpbvFECxtysRkMBADDL8j4zVYSRM7Kp3/']
const web2Urls = ['https://media.niftygateway.com/video/upload/v1659986036/Julian/KennyScharfWestinghouse/WESTINGHOUSE_20-26X44.5X4.5B_x2mz3r.mp4']
const invalidUrls = ['', 'not a url', {}]
const missingUrls = [undefined, null]

describe('scoreAnimationUrl', () => {
  describe('with valid web3 url', () => {
    it.each(web3Urls)('return max possible score', (value) => {
      const score = scoreAnimationUrl(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with valid web2 url', () => {
    it.each(web2Urls)('returns lowered score', (value) => {
      const score = scoreAnimationUrl(value)
      expectLoweredScore(score)
    })
  })
  describe('with invalid url', () => {
    it.each(invalidUrls)('returns lowered score', (value) => {
      const score = scoreAnimationUrl(value)
      expectLoweredScore(score)
    })
  })
  describe('with no url', () => {
    it.each(missingUrls)('returns no score', (value) => {
      const score = scoreAnimationUrl(value)
      expectNoScore(score)
    })
  })
})
