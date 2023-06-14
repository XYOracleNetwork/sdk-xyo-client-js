import { EthereumGasEtherchainV2Payload, EthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { EthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './lib'
import { EthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export type EtherchainEthereumGasWitnessV2Params = WitnessParams<AnyConfigSchema<EthereumGasEtherchainV2WitnessConfig>>

export class EtherchainEthereumGasWitnessV2 extends TimestampWitness<EtherchainEthereumGasWitnessV2Params> {
  static override configSchema = EthereumGasEtherchainV2WitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const payload: EthereumGasEtherchainV2Payload = {
      ...(await getV2GasFromEtherchain()),
      schema: EthereumGasEtherchainV2Schema,
      timestamp: Date.now(),
    }
    return super.observe([payload])
  }
}
