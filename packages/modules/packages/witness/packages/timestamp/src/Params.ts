import type { AnyConfigSchema } from '@xyo-network/module-model'
import type { WitnessParams } from '@xyo-network/witness-model'

import type { TimestampWitnessConfig } from './Config.ts'

export type TimestampWitnessParams<TConfig extends AnyConfigSchema<TimestampWitnessConfig> = AnyConfigSchema<TimestampWitnessConfig>>
  = WitnessParams<TConfig>
