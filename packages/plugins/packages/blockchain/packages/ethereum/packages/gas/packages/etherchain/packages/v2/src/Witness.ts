import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './lib'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema, XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV2 extends TimestampWitness<XyoEthereumGasEtherchainV2WitnessConfig> {
  static override configSchema = XyoEthereumGasEtherchainV2WitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherchainV2WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV2> {
    return (await super.create(params)) as XyoEtherchainEthereumGasWitnessV2
  }

  override async observe(): Promise<XyoPayload[]> {
    const payload: XyoEthereumGasEtherchainV2Payload = {
      ...(await getV2GasFromEtherchain()),
      schema: XyoEthereumGasEtherchainV2Schema,
      timestamp: Date.now(),
    }
    return super.observe([payload])
  }
}
