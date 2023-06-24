import { scoreAnimationUrl } from '../animationUrl'
import { expectLoweredScore, expectMaxPossibleScore, expectNoScore } from './testHelpers'

const web3Urls = ['ipfs://QmaXTuWjEbDuvcA3dHypqHfxMzDLq78Zj5kBLN4JdMEYDB/3.mp4', 'ipfs://QmTxDYfccVVWoucpbvFECxtysRkMBADDL8j4zVYSRM7Kp3/']
const web2Urls = ['https://media.niftygateway.com/video/upload/v1659986036/Julian/KennyScharfWestinghouse/WESTINGHOUSE_20-26X44.5X4.5B_x2mz3r.mp4']
const missingUrls = ['', undefined, null]

describe('scoreAnimationUrl', () => {
  describe('with valid web3 Url', () => {
    it.each(web3Urls)('return max possible score', (url) => {
      const score = scoreAnimationUrl(url)
      expectMaxPossibleScore(score)
    })
  })
  describe('with valid web2 Url', () => {
    it.each(web2Urls)('evaluates the URL', (url) => {
      const score = scoreAnimationUrl(url)
      expectLoweredScore(score)
    })
  })
  describe('scoreAnimationUrl', () => {
    it.each(missingUrls)('evaluates the URL', (url) => {
      const score = scoreAnimationUrl(url)
      expectNoScore(score)
    })
  })
})
