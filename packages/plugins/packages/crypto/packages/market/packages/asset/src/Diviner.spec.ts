import { XyoAccount } from '@xyo-network/account'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetQueryPayload } from './Query'
import { XyoCryptoMarketAssetPayloadSchema, XyoCryptoMarketAssetQueryPayloadSchema } from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner({
      account: new XyoAccount(),
      schema: 'network.xyo.crypto.market.asset.diviner.config',
      targetSchema: XyoCryptoMarketAssetPayloadSchema,
    })
    const query: XyoCryptoMarketAssetQueryPayload = {
      payloads: { coinGeckoPayload, uniswapPayload },
      schema: XyoCryptoMarketAssetQueryPayloadSchema,
    }
    const result = await sut.query(query)
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
