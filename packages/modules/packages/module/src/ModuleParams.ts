import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'
import { XyoWalletBase } from '@xyo-network/wallet'

export type BasicModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> = {
  config: TConfig
  logger?: Logger
} & TAdditionalParams

export type AccountModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> = BasicModuleParams<
  TConfig,
  TAdditionalParams & {
    account: AccountInstance
  }
>

export type WalletModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> = BasicModuleParams<
  TConfig,
  TAdditionalParams & {
    accountDerivationPath: string
    wallet: XyoWalletBase
  }
>

export type ModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> =
  | AccountModuleParams<TConfig, TAdditionalParams>
  | WalletModuleParams<TConfig, TAdditionalParams>
  | BasicModuleParams<TConfig, TAdditionalParams>
