import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { WitnessConfig } from './Config.ts'

export interface WitnessParams<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
> extends ModuleParams<TConfig> {}
