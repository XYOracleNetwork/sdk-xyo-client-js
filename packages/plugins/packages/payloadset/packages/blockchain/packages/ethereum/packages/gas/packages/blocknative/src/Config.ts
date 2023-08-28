import { TimestampWitnessConfig } from '@xyo-network/witness'

import { EthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type EthereumGasBlocknativeWitnessConfig = TimestampWitnessConfig<{
  schema: EthereumGasBlocknativeWitnessConfigSchema
}>
