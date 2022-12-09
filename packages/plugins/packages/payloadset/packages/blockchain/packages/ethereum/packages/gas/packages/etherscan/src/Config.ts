import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEtherscanWitnessConfig = XyoWitnessConfig<{
  apiKey: string
  schema: XyoEthereumGasEtherscanWitnessConfigSchema
}>
