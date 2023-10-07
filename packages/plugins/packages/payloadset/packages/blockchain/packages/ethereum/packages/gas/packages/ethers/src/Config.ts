import { WitnessConfig } from '@xyo-network/witness-model'

import { EthereumGasEthersWitnessConfigSchema } from './Schema'

export type EthereumGasEthersWitnessConfig = WitnessConfig<{
  schema: EthereumGasEthersWitnessConfigSchema
}>
