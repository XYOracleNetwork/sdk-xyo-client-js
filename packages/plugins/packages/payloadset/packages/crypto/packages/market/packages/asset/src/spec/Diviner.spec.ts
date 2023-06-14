import { CryptoMarketAssetPayload, CryptoMarketAssetSchema } from '@xyo-network/crypto-asset-payload-plugin'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { Payload } from '@xyo-network/payload-model'

import { CryptoMarketAssetDiviner } from '../Diviner'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from '../test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  const cases: [input: string, expected: string, data: Payload[]][] = [
    ['only CoinGecko Payload', 'observation', [coinGeckoPayload]],
    ['only Uniswap Payload', 'observation', [uniswapPayload]],
    ['CoinGecko & Uniswap Payload', 'observation', [coinGeckoPayload, uniswapPayload]],
    ['no inputs', 'empty observation', []],
  ]
  test.each(cases)('with %s returns %s', async (_input: string, _expected: string, data: Payload[]) => {
    const module = await CryptoMarketAssetDiviner.create()
    const wrapper = DivinerWrapper.wrap(module)
    const payloads = await wrapper.divine(data)
    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === CryptoMarketAssetSchema) {
        const assetPayload = payload as CryptoMarketAssetPayload
        expect(assetPayload).toBeObject()
        expect(assetPayload?.assets).toBeObject()
        expect(assetPayload?.schema).toBe(CryptoMarketAssetSchema)
        expect(assetPayload?.timestamp).toBeNumber()
      }
    })
  })
})
