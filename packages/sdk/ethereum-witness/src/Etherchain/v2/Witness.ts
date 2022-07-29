import { XyoQueryWitness } from '@xyo-network/witness'

import { getV2GasFromEtherchain } from './getV2GasFromEtherchain'
import { XyoEthereumGasEtherchainPayloadV2, XyoEthereumGasEtherchainQueryPayloadV2 } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoQueryWitness<XyoEthereumGasEtherchainPayloadV2, XyoEthereumGasEtherchainQueryPayloadV2> {
  constructor() {
    super({ query: { schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.query', targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2' } })
  }
  override async observe(): Promise<XyoEthereumGasEtherchainPayloadV2> {
    const fields = await getV2GasFromEtherchain()
    return await super.observe({
      ...fields,
      timestamp: Date.now(),
    })
  }
}
