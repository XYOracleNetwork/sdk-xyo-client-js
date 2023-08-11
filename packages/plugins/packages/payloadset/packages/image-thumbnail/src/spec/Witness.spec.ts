import { ImageThumbnailWitness } from '../Witness'

describe('Witness', () => {
  describe('checkIpfsUrl', () => {
    const cases: [uri: string, expected: string][] = [
      [
        'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
        'https://cloudflare-ipfs.com/ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
      ],
      ['ipfs://QmWX3Kx2NX3AK8WxTQwktVYLMFHX3pHm77ThynhgmU8dP8', 'https://cloudflare-ipfs.com/ipfs/QmWX3Kx2NX3AK8WxTQwktVYLMFHX3pHm77ThynhgmU8dP8'],
    ]
    it.each(cases)('%s', (input, expected) => {
      const actual = ImageThumbnailWitness.checkIpfsUrl(input)
      expect(actual).toBe(expected)
    })
  })
})
