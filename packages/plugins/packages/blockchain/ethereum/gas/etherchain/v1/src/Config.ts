import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'

export type XyoEthereumGasEtherchainV1WitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEtherchainV1Payload,
  {
    schema: XyoEthereumGasEtherchainV1WitnessConfigSchema
  }
>
