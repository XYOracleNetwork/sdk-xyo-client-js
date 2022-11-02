import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema, XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV2Payload,
  XyoEthereumGasEtherchainV2WitnessConfig
> {
  static override configSchema = XyoEthereumGasEtherchainV2WitnessConfigSchema
  static override targetSchema = XyoEthereumGasEtherchainV2Schema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherchainV2WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV2> {
    return (await super.create(params)) as XyoEtherchainEthereumGasWitnessV2
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV2Payload[]> {
    return super.observe([await getV2GasFromEtherchain()])
  }
}
