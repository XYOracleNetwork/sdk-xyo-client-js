import { XyoAccount } from '@xyo-network/account'
import { XyoWitness } from '@xyo-network/witness'

import { getV1GasFromEtherchain } from './getV1GasFromEtherchain'
import { XyoEthereumGasEtherchainV1Config, XyoEthereumGasEtherchainV1Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoWitness<XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1Config> {
  constructor(account = new XyoAccount()) {
    super({
      account,
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1.config',
      targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1',
    })
  }
  override async observe(): Promise<XyoEthereumGasEtherchainV1Payload> {
    const fields = await getV1GasFromEtherchain()
    return {
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1',
      ...fields,
      timestamp: Date.now(),
    }
  }
}
