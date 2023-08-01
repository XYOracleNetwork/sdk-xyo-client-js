import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { SentinelConfig } from './Config'

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>
