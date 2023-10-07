import { AnyConfigSchema } from '@xyo-network/module-model'
import { WitnessParams } from '@xyo-network/witness-model'

import { EnvironmentWitnessConfig } from './Config'

export type EnvironmentWitnessParams<TConfig extends AnyConfigSchema<EnvironmentWitnessConfig> = AnyConfigSchema<EnvironmentWitnessConfig>> =
  WitnessParams<TConfig>
