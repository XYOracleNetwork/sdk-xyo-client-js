import { scoreImage } from '../image'
import { expectLoweredScore, expectMaxPossibleScore, expectMiniumScore } from './testHelpers'

const web3Urls = ['ipfs://QmaXTuWjEbDuvcA3dHypqHfxMzDLq78Zj5kBLN4JdMEYDB/3.mp4', 'ipfs://QmTxDYfccVVWoucpbvFECxtysRkMBADDL8j4zVYSRM7Kp3/']
const secureWeb2Urls = [
  'https://media.niftygateway.com/video/upload/v1659986036/Julian/KennyScharfWestinghouse/WESTINGHOUSE_20-26X44.5X4.5B_x2mz3r.mp4',
]
const insecureWeb2Urls = [
  'http://media.niftygateway.com/video/upload/v1659986036/Julian/KennyScharfWestinghouse/WESTINGHOUSE_20-26X44.5X4.5B_x2mz3r.mp4',
]
const invalidUrls = ['', 'not a url', {}]
const missingUrls = [undefined, null]

describe('scoreImage', () => {
  describe('with web3 url', () => {
    it.each(web3Urls)('return max possible score', (value) => {
      const score = scoreImage(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with valid secure url', () => {
    it.each(secureWeb2Urls)('returns lowered score', (value) => {
      const score = scoreImage(value)
      expectLoweredScore(score)
    })
  })
  describe('with valid insecure url', () => {
    it.each(insecureWeb2Urls)('returns lowered score', (value) => {
      const score = scoreImage(value)
      expectLoweredScore(score)
    })
  })
  describe('with invalid url', () => {
    it.each(invalidUrls)('returns lowered score', (value) => {
      const score = scoreImage(value)
      expectMiniumScore(score)
    })
  })
  describe('with no url', () => {
    it.each(missingUrls)('returns no score', (value) => {
      const score = scoreImage(value)
      expectMiniumScore(score)
    })
  })
})
