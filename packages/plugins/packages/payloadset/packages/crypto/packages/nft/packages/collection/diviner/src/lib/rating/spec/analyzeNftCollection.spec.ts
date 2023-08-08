import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { analyzeNftCollection } from '../analyzeNftCollection'

describe('analyzeNftCollection', () => {
  let collections: NftCollectionInfo[]
  beforeAll(async () => {
    const filePath = join(__dirname, 'testData.json')
    const fileContents = await readFile(filePath, 'utf8')
    collections = JSON.parse(fileContents) as NftCollectionInfo[]
  })
  it('evaluates the NFT collection', async () => {
    await Promise.all(
      collections.map(async (collection) => {
        const rating = await analyzeNftCollection(collection)
        expect(rating).toBeObject()
        Object.entries(rating).map(([key, score]) => {
          expect(key).toBeString()
          const [total, possible] = score
          expect(total).toBeNumber()
          expect(total).not.toBeNegative()
          expect(possible).toBeNumber()
          expect(possible).not.toBeNegative()
          expect(total).toBeLessThanOrEqual(possible)
        })
      }),
    )
  })
})
