import { NftInfo, NftInfoPayload, NftSchema, NftScoreDivinerConfigSchema } from '@xyo-network/crypto-wallet-nft-payload-plugin'
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
      data = nfts.map<NftInfoPayload>((info: NftInfo) => {
        return { ...info, schema: NftSchema }
      })
    }
  })
  test('divine', async () => {
    const diviner = await NftScoreDiviner.create({ config: { schema: NftScoreDivinerConfigSchema } })
    const result = await diviner.divine(data)
    const scores = result.filter(isNftScorePayload)
    expect(scores.length).toBeGreaterThan(0)
    expect(result.length).toEqual(scores.length)
    for (const score of scores) {
      const wrapped = PayloadWrapper.wrap(score)
      expect(await wrapped.getValid()).toBe(true)
    }
  })
})
