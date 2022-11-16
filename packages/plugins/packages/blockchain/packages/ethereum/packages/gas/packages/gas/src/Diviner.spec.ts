import { XyoDivinerWrapper } from '@xyo-network/diviner'

import { XyoEthereumGasDiviner } from './Diviner'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
import { sampleCoinGeckoPayload, sampleUniswapPayload } from './test'

const coinGeckoPayload = sampleCoinGeckoPayload
const uniswapPayload = sampleUniswapPayload

describe('Diviner', () => {
  test('returns observation', async () => {
    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new XyoDivinerWrapper(module)

    const payloads = await wrapper.divine([coinGeckoPayload, uniswapPayload])
    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === XyoEthereumGasSchema) {
        const assetPayload = payload as XyoEthereumGasPayload
        expect(assetPayload).toBeObject()
        expect(assetPayload?.assets).toBeObject()
        expect(assetPayload?.schema).toBe(XyoEthereumGasSchema)
        expect(assetPayload?.timestamp).toBeNumber()
      }
    })
  })
})
