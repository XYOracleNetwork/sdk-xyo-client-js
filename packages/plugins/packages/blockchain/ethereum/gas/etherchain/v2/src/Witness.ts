import { XyoWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoWitness<XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2WitnessConfig> {
  override async observe(): Promise<XyoEthereumGasEtherchainV2Payload> {
    return super.observe(await getV2GasFromEtherchain())
  }
}
