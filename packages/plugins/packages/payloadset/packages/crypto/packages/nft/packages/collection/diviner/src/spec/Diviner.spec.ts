import { HDWallet } from '@xyo-network/account'
import { NftCollectionInfoPayload, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { isNftCollectionScorePayload, NftCollectionScoreDiviner } from '../Diviner'

describe('NftCollectionScoreDiviner', () => {
  const data: NftCollectionInfoPayload[] = [
    {
      address: '0x0000000000',
      chainId: 1,
      metrics: {
        metadata: {
          attributes: {},
        },
      },
      name: 'test',
      schema: NftCollectionSchema,
      symbol: 'TEST',
      tokenType: 'ERC721',
      total: 20000,
    },
  ]
  test('divine', async () => {
    const diviner = await NftCollectionScoreDiviner.create({ account: await HDWallet.random() })
    const scores = (await diviner.divine(data)).filter(isNftCollectionScorePayload)
    expect(scores).toBeArrayOfSize(data.length)
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i]
      const wrapped = PayloadWrapper.wrap(score)
      expect(await wrapped.getValid()).toBe(true)
      const payload = wrapped.payload()
      expect(payload?.sources).toBeArrayOfSize(1)
      expect(payload?.sources?.[0]).toBeString()
      const sourceHash = await PayloadWrapper.wrap(data[i]).hashAsync()
      expect(payload?.sources?.[0]).toBe(sourceHash)
    }
  })
})
