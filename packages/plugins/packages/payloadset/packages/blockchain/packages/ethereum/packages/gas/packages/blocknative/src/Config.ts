import { WitnessConfig } from '@xyo-network/witness'

import { EthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type EthereumGasBlocknativeWitnessConfig = WitnessConfig<{
  schema: EthereumGasBlocknativeWitnessConfigSchema
}>
