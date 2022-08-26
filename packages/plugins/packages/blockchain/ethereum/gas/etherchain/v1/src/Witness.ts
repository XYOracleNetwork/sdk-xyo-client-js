import { XyoTimestampWitness } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { getV1GasFromEtherchain } from './etherchain'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'

export class XyoEtherchainEthereumGasWitnessV1 extends XyoTimestampWitness<
  XyoEthereumGasEtherchainV1Payload,
  XyoEthereumGasEtherchainV1WitnessConfig
> {
  override async observe(): Promise<XyoEthereumGasEtherchainV1Payload> {
    return super.observe(await getV1GasFromEtherchain())
  }
}
