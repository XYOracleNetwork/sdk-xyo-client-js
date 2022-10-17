import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV2Payload,
  XyoEthereumGasEtherchainV2WitnessConfig
> {
  static override async create(params?: XyoModuleParams): Promise<XyoEtherchainEthereumGasWitnessV2> {
    const module = new XyoEtherchainEthereumGasWitnessV2(params as XyoModuleParams<XyoEthereumGasEtherchainV2WitnessConfig>)
    await module.start()
    return module
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV2Payload[]> {
    return super.observe([await getV2GasFromEtherchain()])
  }
}
