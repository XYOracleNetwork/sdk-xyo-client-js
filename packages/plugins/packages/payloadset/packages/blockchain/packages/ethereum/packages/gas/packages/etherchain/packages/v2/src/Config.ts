import { WitnessConfig } from '@xyo-network/witness'

import { EthereumGasEtherchainV2WitnessConfigSchema } from './Schema'

export type EthereumGasEtherchainV2WitnessConfig = WitnessConfig<{
  schema: EthereumGasEtherchainV2WitnessConfigSchema
}>
