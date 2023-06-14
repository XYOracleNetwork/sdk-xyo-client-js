import { WitnessConfig } from '@xyo-network/witness'

import { EthereumGasEtherscanWitnessConfigSchema } from './Schema'

export type EthereumGasEtherscanWitnessConfig = WitnessConfig<{
  apiKey: string
  schema: EthereumGasEtherscanWitnessConfigSchema
}>
