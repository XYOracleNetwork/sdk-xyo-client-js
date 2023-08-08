import { NftCollectionInfoPayload } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { scoreMetadata } from '../metadata'

describe('scoreMetadata', () => {
  let collections: NftCollectionInfoPayload[]
  beforeAll(async () => {
    const filePath = join(__dirname, '../../../../spec', 'testData.json')
    const fileContents = await readFile(filePath, 'utf8')
    collections = JSON.parse(fileContents) as NftCollectionInfoPayload[]
  })
  it('evaluates the NFT collection', async () => {
    await Promise.all(
      collections.map((collection) => {
        const score = scoreMetadata(collection)
        const [total, possible] = score
        expect(total).toBeNumber()
        expect(total).not.toBeNegative()
        expect(possible).toBeNumber()
        expect(possible).not.toBeNegative()
        expect(total).toBeLessThanOrEqual(possible)
      }),
    )
  })
})
