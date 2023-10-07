import { TimestampWitnessConfig } from '@xyo-network/witness-timestamp'

import { EthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type EthereumGasBlocknativeWitnessConfig = TimestampWitnessConfig<{
  schema: EthereumGasBlocknativeWitnessConfigSchema
}>
