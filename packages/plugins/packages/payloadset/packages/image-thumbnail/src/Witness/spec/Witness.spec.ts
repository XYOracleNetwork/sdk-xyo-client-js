import { HDWallet } from '@xyo-network/account'
import { mock } from 'jest-mock-extended'

import { ImageThumbnailWitness } from '../Witness'

/**
 * @group thumbnail
 */

describe('Witness', () => {
  describe('checkIpfsUrl', () => {
    const logger = mock<Console>()
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
    let witness: ImageThumbnailWitness
    beforeAll(async () => {
      witness = await ImageThumbnailWitness.create({
        config: { schema: ImageThumbnailWitness.configSchema },
        logger,
        wallet: await HDWallet.random(),
      })
    })
    it.each(cases)('%s', (input, expected) => {
      const actual = witness.checkIpfsUrl(input)
      expect(actual).toBe(expected)
    })
  })
})
