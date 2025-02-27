import { EmptyObject } from '@xylabs/object'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'

import { SentinelConfig } from './Config.ts'

export type SentinelParams<
  TConfig extends AnyConfigSchema<SentinelConfig> = AnyConfigSchema<SentinelConfig>,
  TAdditionalParams extends EmptyObject | void = void,
> = ModuleParams<TConfig, TAdditionalParams>
