import { XyoAccount } from '@xyo-network/account'
import { XyoWitness } from '@xyo-network/witness'

import { getV2GasFromEtherchain } from './getV2GasFromEtherchain'
import { XyoEthereumGasEtherchainV2Config, XyoEthereumGasEtherchainV2Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoWitness<XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2Config> {
  constructor(account = new XyoAccount()) {
    super({
      account,
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.config',
      targetSchema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2',
    })
  }
  override async observe(): Promise<XyoEthereumGasEtherchainV2Payload> {
    const fields = await getV2GasFromEtherchain()
    return {
      schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2',
      ...fields,
      timestamp: Date.now(),
    }
  }
}
