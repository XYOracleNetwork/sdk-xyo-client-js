import { PartialWitnessConfig, XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV1Payload,
  XyoEthereumGasEtherchainV1WitnessConfig
> {
  constructor(config: PartialWitnessConfig<XyoEthereumGasEtherchainV1WitnessConfig>) {
    super({ schema: XyoEthereumGasEtherchainV1WitnessConfigSchema, targetSchema: XyoEthereumGasEtherchainV1Schema, ...config })
  }

  override async observe(): Promise<XyoEthereumGasEtherchainV1Payload> {
    return super.observe(await getV1GasFromEtherchain())
  }
}
