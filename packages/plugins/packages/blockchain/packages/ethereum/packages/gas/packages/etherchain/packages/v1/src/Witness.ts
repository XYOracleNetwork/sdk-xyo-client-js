import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './lib'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV1 extends TimestampWitness<XyoEthereumGasEtherchainV1WitnessConfig> {
  static override configSchema = XyoEthereumGasEtherchainV1WitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoEthereumGasEtherchainV1WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV1> {
    return (await super.create(params)) as XyoEtherchainEthereumGasWitnessV1
  }

  override async observe(): Promise<XyoPayload[]> {
    const payload: XyoEthereumGasEtherchainV1Payload = {
      ...(await getV1GasFromEtherchain()),
      schema: XyoEthereumGasEtherchainV1Schema,
      timestamp: Date.now(),
    }
    return super.observe([payload])
  }
}
