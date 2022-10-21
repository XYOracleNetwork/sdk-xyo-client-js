import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV1Payload,
  XyoEthereumGasEtherchainV1WitnessConfig
> {
  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherchainV1WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV1> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoEtherchainEthereumGasWitnessV1(params)
    await module.start()
    return module
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV1Payload[]> {
    return super.observe([await getV1GasFromEtherchain()])
  }
}
