import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { XyoDivinerDivineQuerySchema, XyoDivinerQueryPayload } from '@xyo-network/diviner'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetDivinerConfigSchema, XyoCryptoMarketAssetPayloadSchema } from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner({
      account: new XyoAccount(),
      schema: XyoCryptoMarketAssetDivinerConfigSchema,
      targetSchema: XyoCryptoMarketAssetPayloadSchema,
    })
    const query: XyoDivinerQueryPayload = {
      payloads: [coinGeckoPayload, uniswapPayload],
      schema: XyoDivinerDivineQuerySchema,
    }
    const result = await sut.query(query)
    expect(result).toBeArray()
    expect(result.length).toBe(2)
    const bw = result[0]
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
    const payloads = result[1]
    expect(payloads).toBeArray()
    payloads.map((payload) => {
      if (payload?.schema === XyoCryptoMarketAssetPayloadSchema) {
        const assetPayload = payload as XyoCryptoMarketAssetPayload
        expect(assetPayload).toBeObject()
        expect(assetPayload?.assets).toBeObject()
        expect(assetPayload?.schema).toBe(XyoCryptoMarketAssetPayloadSchema)
        expect(assetPayload?.timestamp).toBeNumber()
      }
    })
  })
})
