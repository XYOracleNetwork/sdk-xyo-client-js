import { XyoAccount } from '@xyo-network/account'
import { XyoWitness } from '@xyo-network/witness'

import { getV1GasFromEtherchain } from './getV1GasFromEtherchain'
import { XyoEthereumGasEtherchainPayloadV1, XyoEthereumGasEtherchainQueryPayloadV1 } from './Payload'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoWitness<XyoEthereumGasEtherchainPayloadV1, XyoEthereumGasEtherchainQueryPayloadV1> {
  constructor(account = new XyoAccount()) {
    super({
      account,
      query: { schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1.query', targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1' },
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1.config',
      targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1',
    })
  }
  override async observe(): Promise<XyoEthereumGasEtherchainPayloadV1> {
    const fields = await getV1GasFromEtherchain()
    return {
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1',
      ...fields,
      timestamp: Date.now(),
    }
  }
}
