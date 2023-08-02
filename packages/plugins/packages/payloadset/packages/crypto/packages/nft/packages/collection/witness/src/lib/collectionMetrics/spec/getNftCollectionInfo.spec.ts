import { NftInfoPayload } from '@xyo-network/crypto-nft-payload-plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { getNftCollectionMetrics } from '../getNftCollectionMetrics'

describe('getNftCollectionMetrics', () => {
  test('gets NFTs collection metrics', async () => {
    const filePath = join(__dirname, '..', 'lib', 'spec', 'testData.json')
    const fileContents = await readFile(filePath, 'utf8')
    const nfts = JSON.parse(fileContents) as NftInfoPayload[]
    const result = getNftCollectionMetrics(nfts)
    expect(result).toBeObject()
    expect(result?.distribution).toBeObject()
    expect(result?.distribution?.metadata).toBeObject()
    expect(result?.distribution?.metadata?.attributes).toBeObject()
  })
})
