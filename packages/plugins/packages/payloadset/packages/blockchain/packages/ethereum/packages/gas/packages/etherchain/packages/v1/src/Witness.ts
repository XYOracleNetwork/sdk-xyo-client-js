import { XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-ethereum-gas-v1-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { TimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './lib'
import { XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV1 extends TimestampWitness<XyoEthereumGasEtherchainV1WitnessConfig> {
  static override configSchema = XyoEthereumGasEtherchainV1WitnessConfigSchema

  static override async create(params?: ModuleParams<XyoEthereumGasEtherchainV1WitnessConfig>): Promise<XyoEtherchainEthereumGasWitnessV1> {
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
