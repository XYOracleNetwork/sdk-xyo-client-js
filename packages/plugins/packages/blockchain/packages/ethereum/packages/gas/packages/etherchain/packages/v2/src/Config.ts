import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export type XyoEthereumGasEtherchainV2WitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEtherchainV2Payload,
  {
    schema: XyoEthereumGasEtherchainV2WitnessConfigSchema
  }
>
