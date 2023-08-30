import { ImageThumbnailWitness } from '../Witness'

describe('Witness', () => {
  describe('checkIpfsUrl', () => {
    const cases: [uri: string, expected: string][] = [
      [
        'ipfs://ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
        'https://5d7b6582.beta.decentralnetworkservices.com/ipfs/QmewywDQGqz9WuWfT11ueSR3Mu86MejfD64v3KtFRzGP2G/image.jpeg',
      ],
      [
        'ipfs://QmWX3Kx2NX3AK8WxTQwktVYLMFHX3pHm77ThynhgmU8dP8',
        'https://5d7b6582.beta.decentralnetworkservices.com/ipfs/QmWX3Kx2NX3AK8WxTQwktVYLMFHX3pHm77ThynhgmU8dP8',
      ],
    ]
    it.each(cases)('%s', async (input, expected) => {
      const witness = await ImageThumbnailWitness.create()
      const actual = witness.checkIpfsUrl(input)
      expect(actual).toBe(expected)
    })
  })
})
