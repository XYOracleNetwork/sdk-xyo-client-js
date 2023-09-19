import { AnyConfigSchema } from '@xyo-network/module'
import { WitnessParams } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfig } from './Config'

export type EnvironmentWitnessParams<TConfig extends AnyConfigSchema<EnvironmentWitnessConfig> = AnyConfigSchema<EnvironmentWitnessConfig>> =
  WitnessParams<TConfig>
