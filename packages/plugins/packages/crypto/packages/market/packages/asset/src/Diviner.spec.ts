import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness'

import { XyoCryptoMarketAssetDiviner } from './Diviner'
import { XyoCryptoMarketAssetQueryPayload } from './Query'
import {
  XyoCryptoMarketAssetDivinerConfigPayloadSchema,
  XyoCryptoMarketAssetDivinerQueryPayloadSchema,
  XyoCryptoMarketAssetPayloadSchema,
} from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const sut = new XyoCryptoMarketAssetDiviner({
      account: new XyoAccount(),
      schema: XyoCryptoMarketAssetDivinerConfigPayloadSchema,
    })
    const query: XyoCryptoMarketAssetQueryPayload = {
      payloads: { coinGeckoPayload, uniswapPayload },
      schema: XyoCryptoMarketAssetDivinerQueryPayloadSchema,
    }
    const result = await sut.query(query)
    expect(result).toBeArray()
    expect(result.length).toBe(2)
    const bw = result[0]
    expect(bw.schema).toBe(XyoBoundWitnessSchema)
    const payloads = result[1]
    expect(payloads).toBeArray()
    payloads.map((payload) => {
      expect(payload).toBeObject()
      expect(payload?.assets).toBeObject()
      expect(payload?.schema).toBe(XyoCryptoMarketAssetPayloadSchema)
      expect(payload?.timestamp).toBeNumber()
    })
  })
})
