import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { WitnessConfig } from './Config'
export type WitnessParams<
  TConfig extends AnyConfigSchema<WitnessConfig> = AnyConfigSchema<WitnessConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>
