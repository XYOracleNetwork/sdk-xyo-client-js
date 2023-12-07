import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { AnyObject } from '@xyo-network/object'

import { WitnessConfig } from './Config'

export type WitnessParams<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TAdditionalParams extends AnyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
