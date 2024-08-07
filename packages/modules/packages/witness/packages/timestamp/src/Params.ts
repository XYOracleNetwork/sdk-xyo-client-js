import { AnyConfigSchema } from '@xyo-network/module-model'
import { WitnessParams } from '@xyo-network/witness-model'

import { TimestampWitnessConfig } from './Config.ts'

export type TimestampWitnessParams<TConfig extends AnyConfigSchema<TimestampWitnessConfig> = AnyConfigSchema<TimestampWitnessConfig>> =
  WitnessParams<TConfig>
