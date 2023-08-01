import { HDWallet } from '@xyo-network/account'
import { isNftInfoPayload, NftInfoPayload } from '@xyo-network/crypto-wallet-nft-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { isNftScorePayload, NftScoreDiviner } from '../Diviner'

describe('NftScoreDiviner', () => {
  let data: NftInfoPayload[]
  beforeAll(async () => {
    const filePath = join(__dirname, 'testData.json')
    const fileContents = await readFile(filePath, 'utf8')
    const nfts = JSON.parse(fileContents)
    expect(nfts).toBeArray()
    if (Array.isArray(nfts)) {
      data = nfts.filter(isNftInfoPayload)
    }
  })
  test('divine', async () => {
    const diviner = await NftScoreDiviner.create({ account: await HDWallet.random() })
    const scores = (await diviner.divine(data)).filter(isNftScorePayload)
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
