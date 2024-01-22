import { EmptyObject } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { WitnessConfig } from './Config'

export type WitnessParams<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
