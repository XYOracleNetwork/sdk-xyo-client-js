import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEtherscanWitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEtherscanPayload,
  {
    schema: XyoEthereumGasEtherscanWitnessConfigSchema
    apiKey: string
  }
>
