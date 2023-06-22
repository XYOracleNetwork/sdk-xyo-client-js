import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams, WithAdditional } from '@xyo-network/core'
import { WalletInstance } from '@xyo-network/wallet-model'

import { AnyConfigSchema, ModuleConfig } from './Config'

export type BasicModuleParams<TConfig extends AnyConfigSchema, TAdditionalParams extends AnyObject | undefined = undefined> = WithAdditional<
  BaseParams<{
    config: TConfig
  }>,
  TAdditionalParams
>

export type AccountModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  WithAdditional<
    {
      account: AccountInstance
    },
    TAdditionalParams
  >
>

export type WalletModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  WithAdditional<
    {
      accountDerivationPath: string
      wallet: WalletInstance
    },
    TAdditionalParams
  >
>

export type ModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = (
  | AccountModuleParams<TConfig, TAdditionalParams>
  | WalletModuleParams<TConfig, TAdditionalParams>
  | BasicModuleParams<TConfig, TAdditionalParams>
) &
  BasicModuleParams<TConfig, TAdditionalParams>
