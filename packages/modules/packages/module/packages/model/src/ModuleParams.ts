import { BaseParams, EmptyObject, WithAdditional } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'

import { AnyConfigSchema, ModuleConfig } from './Config'

export type ModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig> | void = void,
  TAdditionalParams extends EmptyObject | void = void,
> = WithAdditional<
  BaseParams<{
    account?: AccountInstance | 'random'
    config: TConfig extends AnyConfigSchema<ModuleConfig> ? TConfig : AnyConfigSchema<ModuleConfig>
    ephemeralQueryAccountEnabled?: boolean
  }>,
  TAdditionalParams
>
