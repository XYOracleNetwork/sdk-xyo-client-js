import { XyoAccount } from '@xyo-network/account'
import { XyoWitness } from '@xyo-network/witness'

import { getV2GasFromEtherchain } from './getV2GasFromEtherchain'
import { XyoEthereumGasEtherchainPayloadV2, XyoEthereumGasEtherchainQueryPayloadV2 } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoWitness<XyoEthereumGasEtherchainPayloadV2, XyoEthereumGasEtherchainQueryPayloadV2> {
  constructor(account = new XyoAccount()) {
    super({
      account,
      query: { schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.query' },
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.config',
      targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2',
    })
  }
  override async observe(): Promise<XyoEthereumGasEtherchainPayloadV2> {
    const fields = await getV2GasFromEtherchain()
    return {
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2',
      ...fields,
      timestamp: Date.now(),
    }
  }
}
