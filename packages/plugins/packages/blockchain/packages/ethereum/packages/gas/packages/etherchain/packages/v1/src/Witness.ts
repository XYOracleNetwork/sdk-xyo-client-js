import { XyoModuleParams } from '@xyo-network/module'
import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV1Payload,
  XyoEthereumGasEtherchainV1WitnessConfig
> {
  static override configSchema = XyoEthereumGasEtherchainV1WitnessConfigSchema
  static override targetSchema = XyoEthereumGasEtherchainV1Schema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherchainV1WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV1> {
    return (await super.create(params)) as XyoEtherchainEthereumGasWitnessV1
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV1Payload[]> {
    return super.observe([await getV1GasFromEtherchain()])
  }
}
