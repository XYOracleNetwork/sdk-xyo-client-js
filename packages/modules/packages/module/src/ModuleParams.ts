import { Account } from '@xyo-network/account'
import { AnyObject } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module-model'
import { Logger } from '@xyo-network/shared'
import { XyoWalletBase } from '@xyo-network/wallet'

import { CompositeModuleResolver } from './Resolver'

export type BasicModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> = {
  config: TConfig
  logger?: Logger
  resolver?: CompositeModuleResolver
} & TAdditionalParams

export type AccountModuleParams<TConfig extends ModuleConfig = ModuleConfig, TAdditionalParams extends AnyObject = AnyObject> = BasicModuleParams<
  TConfig,
  TAdditionalParams & {
    account: Account
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
