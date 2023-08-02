import { NftInfoPayload, OpenSeaNftAttribute } from '@xyo-network/crypto-nft-payload-plugin'
import { readFile } from 'fs/promises'
import { join } from 'path'

import { calculateAllPropertiesDistribution } from '../calculateAllPropertiesDistribution'

describe('calculateAllPropertiesDistribution', () => {
  test('calculates the property distribution', async () => {
    const filePath = join(__dirname, 'testData.json')
    const fileContents = await readFile(filePath, 'utf8')
    const nfts = JSON.parse(fileContents) as NftInfoPayload[]
    const attributes = nfts
      .map((nft) => nft.metadata?.attributes as OpenSeaNftAttribute[])
      .map((attributes) => {
        return Object.fromEntries(attributes.map((attribute) => [attribute.trait_type, attribute.value]))
      })
    const result = calculateAllPropertiesDistribution(attributes)
    expect(result).toBeObject()
  })
})
