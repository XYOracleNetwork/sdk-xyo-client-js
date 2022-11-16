import { XyoDivinerWrapper } from '@xyo-network/diviner'

import { XyoEthereumGasDiviner } from './Diviner'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
import { sampleEtherchainGasV1, sampleEtherchainGasV2, sampleEtherscanGas } from './test'

describe('Diviner', () => {
  test('returns divined gas price', async () => {
    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new XyoDivinerWrapper(module)

    const payloads = await wrapper.divine([sampleEtherchainGasV1, sampleEtherchainGasV2, sampleEtherscanGas])

    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === XyoEthereumGasSchema) {
        const assetPayload = payload as XyoEthereumGasPayload
        expect(assetPayload).toBeObject()
        expect(assetPayload?.schema).toBe(XyoEthereumGasSchema)
        expect(assetPayload?.timestamp).toBeNumber()
      }
    })
  })
})
