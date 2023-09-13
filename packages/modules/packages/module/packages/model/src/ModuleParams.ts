import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams, WithAdditional } from '@xyo-network/core'
import { WalletInstance } from '@xyo-network/wallet-model'

import { AnyConfigSchema, ModuleConfig } from './Config'

export type ModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig> | void = void,
  TAdditionalParams extends AnyObject | void = void,
> = WithAdditional<
  BaseParams<{
    account?: AccountInstance | 'random'
    config: TConfig extends AnyConfigSchema<ModuleConfig> ? TConfig : AnyConfigSchema<ModuleConfig>
    ephemeralQueryAccountEnabled?: boolean
    wallet?: WalletInstance
  }>,
  TAdditionalParams
>
