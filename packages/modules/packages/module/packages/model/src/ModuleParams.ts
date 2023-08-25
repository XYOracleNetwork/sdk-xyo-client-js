import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams, WithAdditional } from '@xyo-network/core'
import { WalletInstance } from '@xyo-network/wallet-model'

import { AnyConfigSchema, ModuleConfig } from './Config'

export type BasicModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  BaseParams<{
    account?: AccountInstance | 'random'
    config: TConfig
    ephemeralQueryAccountEnabled?: boolean
    wallet?: WalletInstance
  }>,
  TAdditionalParams
>

export type ModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig> = ModuleConfig,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<TConfig, TAdditionalParams>
