import { PartialWitnessConfig, XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { getV2GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema, XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV2 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV2Payload,
  XyoEthereumGasEtherchainV2WitnessConfig
> {
  constructor(config?: PartialWitnessConfig<XyoEthereumGasEtherchainV2WitnessConfig>) {
    super({ schema: XyoEthereumGasEtherchainV2WitnessConfigSchema, targetSchema: XyoEthereumGasEtherchainV2Schema, ...config })
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV2Payload> {
    return super.observe(await getV2GasFromEtherchain())
  }
}
