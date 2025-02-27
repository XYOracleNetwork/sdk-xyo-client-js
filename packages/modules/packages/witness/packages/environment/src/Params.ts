import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { WitnessParams } from '@xyo-network/witness-model'

import type { EnvironmentWitnessConfig } from './Config.ts'

export type EnvironmentWitnessParams<TConfig extends AnyConfigSchema<EnvironmentWitnessConfig> = AnyConfigSchema<EnvironmentWitnessConfig>> =
  WitnessParams<TConfig>
