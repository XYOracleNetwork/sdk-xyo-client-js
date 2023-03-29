import { XyoCryptoMarketAssetPayload, XyoCryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { Payload } from '@xyo-network/payload-model'

import { XyoCryptoMarketAssetDiviner } from '../Diviner'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from '../test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  const cases: [string, Payload[]][] = [
    ['only CoinGecko Payload', [coinGeckoPayload]],
    ['only Uniswap Payload', [uniswapPayload]],
    ['CoinGecko & Uniswap Payload', [coinGeckoPayload, uniswapPayload]],
  ]
  test.each(cases)('with %s returns observation', async (_title: string, inputs: Payload[]) => {
    const module = await XyoCryptoMarketAssetDiviner.create()
    const wrapper = DivinerWrapper.wrap(module)
    const payloads = await wrapper.divine(inputs)
    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
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
