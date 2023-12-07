import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { EmptyObject } from '@xyo-network/object'

import { SentinelConfig } from './Config'

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
