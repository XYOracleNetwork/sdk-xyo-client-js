import type { EmptyObject } from '@xylabs/object'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import type { WitnessConfig } from './Config.ts'

export type WitnessParams<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
