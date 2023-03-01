import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'
import { XyoWalletBase } from '@xyo-network/wallet'

export type WithAdditional<T, TAdditional extends AnyObject | undefined = undefined> = TAdditional extends AnyObject ? T & TAdditional : T

export type BasicModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  {
    config: TConfig
    logger?: Logger
  },
  TAdditionalParams
>

export type AccountModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
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
  TConfig extends ModuleConfig = ModuleConfig,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  WithAdditional<
    {
      accountDerivationPath: string
      wallet: XyoWalletBase
    },
    TAdditionalParams
  >
>

export type ModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject | undefined = undefined> =
  | AccountModuleParams<TConfig, TAdditionalParams>
  | WalletModuleParams<TConfig, TAdditionalParams>
  | BasicModuleParams<TConfig, TAdditionalParams>
