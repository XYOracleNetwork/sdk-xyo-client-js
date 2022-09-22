import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from '@xyo-network/diviner'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetSchema } from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner()
    const query: XyoDivinerQuery = {
      payloads: [coinGeckoPayload, uniswapPayload],
      schema: XyoDivinerDivineQuerySchema,
    }
    const queryBoundwitness = new BoundWitnessBuilder().payload(query).witness(new XyoAccount()).build()
    const result = await sut.query(queryBoundwitness, query)
    expect(result).toBeArray()
    expect(result.length).toBe(2)
    const bw = result[0]
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
    const payloads = result[1]
    expect(payloads).toBeArray()
    payloads.map((payload) => {
      if (payload?.schema === XyoCryptoMarketAssetSchema) {
        const assetPayload = payload as XyoCryptoMarketAssetPayload
        expect(assetPayload).toBeObject()
        expect(assetPayload?.assets).toBeObject()
        expect(assetPayload?.schema).toBe(XyoCryptoMarketAssetSchema)
        expect(assetPayload?.timestamp).toBeNumber()
      }
    })
  })
})
