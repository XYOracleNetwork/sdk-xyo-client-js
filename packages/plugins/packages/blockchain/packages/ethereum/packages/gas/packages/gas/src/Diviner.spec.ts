import { XyoDivinerWrapper } from '@xyo-network/diviner'

import { XyoEthereumGasDiviner } from './Diviner'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
import {
  sampleBlocknativeGas,
  sampleEtherchainGasV1,
  sampleEtherchainGasV2,
  sampleEtherscanGas,
  sampleEthersGas,
  sampleEthgasstationGas,
} from './test'

describe('Diviner', () => {
  test('returns divined gas price', async () => {
    const module = await XyoEthereumGasDiviner.create()
    const wrapper = new XyoDivinerWrapper(module)

    const payloads = await wrapper.divine([
      sampleBlocknativeGas,
      sampleEtherchainGasV1,
      sampleEtherchainGasV2,
      sampleEtherscanGas,
      sampleEthersGas,
      sampleEthgasstationGas,
    ])

    expect(payloads).toBeArray()
    expect(payloads.length).toBe(1)
    payloads.map((payload) => {
      if (payload?.schema === XyoEthereumGasSchema) {
        const gasPayload = payload as XyoEthereumGasPayload
        expect(gasPayload).toBeObject()
        expect(gasPayload.schema).toBe(XyoEthereumGasSchema)
        expect(gasPayload.timestamp).toBeNumber()
      }
    })
  })
})
