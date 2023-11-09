import { Account } from '@xyo-network/account'
import { isNftCollectionScore, NftCollectionInfo, NftCollectionSchema } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { readFile, writeFile } from 'fs/promises'

import { NftCollectionScoreDiviner } from '../Diviner'

describe('NftCollectionScoreDiviner', () => {
  const data: NftCollectionInfo[] = [
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
      total: 20000,
      type: 'ERC721',
    },
  ]
  let diviner: NftCollectionScoreDiviner
  beforeAll(async () => {
    const account = Account.randomSync()
    diviner = await NftCollectionScoreDiviner.create({ account })
  })
  const cases: [address: string, chainId: number][] = [
    ['0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', 1],
    ['0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1],
    ['0x60E4d786628Fea6478F785A6d7e704777c86a7c6', 1],
    ['0xED5AF388653567Af2F388E6224dC7C4b3241C544', 1],
    ['0x059EDD72Cd353dF5106D2B9cC5ab83a52287aC3a', 1],
  ]
  it.skip.each(cases)('diviner calibration', async (address) => {
    const json = await readFile(`./nftData/witness/${address}-witness.json`)
    const data: NftCollectionInfo[] = JSON.parse(json.toString())
    const results = await diviner.divine(data)
    const scores = results.filter(isNftCollectionScore)
    for (const score of scores) {
      const address = score.address
      const total = Object.values(score.scores).reduce(
        ([accValue, accTotal], [value, total]) => {
          return [accValue + value, accTotal + total]
        },
        [0, 0],
      )
      const rating = total[0] / total[1]
      console.log(`Address: ${address} Rating: ${rating}`)
      await writeFile(`./nftData/diviner/${address}-diviner.json`, JSON.stringify(score, null, 2))
    }
  })
  test('divine', async () => {
    const scores = (await diviner.divine(data)).filter(isNftCollectionScore)
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
