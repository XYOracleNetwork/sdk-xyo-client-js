import { scoreAnimationUrl } from '../animationUrl'

const urls = [
  'https://media.niftygateway.com/video/upload/v1659986036/Julian/KennyScharfWestinghouse/WESTINGHOUSE_20-26X44.5X4.5B_x2mz3r.mp4',
  'ipfs://QmaXTuWjEbDuvcA3dHypqHfxMzDLq78Zj5kBLN4JdMEYDB/3.mp4',
  'ipfs://QmTxDYfccVVWoucpbvFECxtysRkMBADDL8j4zVYSRM7Kp3/',
]

describe('scoreAnimationUrl', () => {
  it.each(urls)('evaluates the URL', (url) => {
    const score = scoreAnimationUrl(url)
    const [total, possible] = score
    expect(total).toBeNumber()
    expect(total).not.toBeNegative()
    expect(possible).toBeNumber()
    expect(possible).not.toBeNegative()
    expect(total).toBeLessThanOrEqual(possible)
  })
})
