import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { AnyObject } from '@xyo-network/object'

import { SentinelConfig } from './Config'

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TAdditionalParams extends AnyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
