import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthersWitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEthersPayload,
  {
    apiKey: string
    schema: XyoEthereumGasEthersWitnessConfigSchema
  }
>
