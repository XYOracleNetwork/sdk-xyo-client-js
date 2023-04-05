import { WitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEtherscanWitnessConfig = WitnessConfig<{
  apiKey: string
  schema: XyoEthereumGasEtherscanWitnessConfigSchema
}>
