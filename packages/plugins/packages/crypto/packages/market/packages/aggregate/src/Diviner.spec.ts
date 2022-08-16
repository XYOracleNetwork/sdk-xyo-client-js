import { XyoAccount } from '@xyo-network/account'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetQueryPayload } from './Query'
import { XyoCryptoMarketAssetPayloadSchema, XyoCryptoMarketAssetQueryPayloadSchema } from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner(XyoAccount.random())
    const query: XyoCryptoMarketAssetQueryPayload = {
      payloads: { coinGeckoPayload, uniswapPayload },
      schema: XyoCryptoMarketAssetQueryPayloadSchema,
      targetSchema: XyoCryptoMarketAssetPayloadSchema,
    }
    const result = await sut.divine(query)
    expect(result).toBeArray()
    expect(result.length).toBe(2)
    const bw = result[0]
    expect(bw.schema).toBe('network.xyo.boundwitness')
    const payloads = result[1]
    expect(payloads).toBeArray()
    payloads.map((payload) => {
      expect(payload).toBeObject()
      expect(payload.assets).toBeObject()
      expect(payload.schema).toBe(XyoCryptoMarketAssetPayloadSchema)
      expect(payload.timestamp).toBeNumber()
    })
  })
})
