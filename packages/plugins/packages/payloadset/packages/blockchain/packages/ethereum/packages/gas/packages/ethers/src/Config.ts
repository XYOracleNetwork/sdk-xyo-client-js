import { WitnessConfig } from '@xyo-network/witness'

import { EthereumGasEthersWitnessConfigSchema } from './Schema'

export type EthereumGasEthersWitnessConfig = WitnessConfig<{
  schema: EthereumGasEthersWitnessConfigSchema
}>
