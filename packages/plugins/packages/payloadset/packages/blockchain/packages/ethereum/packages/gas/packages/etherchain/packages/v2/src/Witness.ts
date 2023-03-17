import { XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2Schema } from '@xyo-network/etherchain-ethereum-gas-v2-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { TimestampWitness, WitnessParams } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './lib'
import { XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export type XyoEtherchainEthereumGasWitnessV2Params = WitnessParams<AnyConfigSchema<XyoEthereumGasEtherchainV2WitnessConfig>>

export class XyoEtherchainEthereumGasWitnessV2 extends TimestampWitness<XyoEtherchainEthereumGasWitnessV2Params> {
  static override configSchema = XyoEthereumGasEtherchainV2WitnessConfigSchema

  override async observe(): Promise<Payload[]> {
    const payload: XyoEthereumGasEtherchainV2Payload = {
      ...(await getV2GasFromEtherchain()),
      schema: XyoEthereumGasEtherchainV2Schema,
      timestamp: Date.now(),
    }
    return super.observe([payload])
  }
}
