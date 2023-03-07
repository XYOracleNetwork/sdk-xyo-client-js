import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams } from '@xyo-network/core'
import { ModuleConfig, ModuleQueriedEventArgs } from '@xyo-network/module-model'
import { XyoWalletBase } from '@xyo-network/wallet'
import Emittery from 'emittery'

export type WithAdditional<T, TAdditional extends AnyObject | undefined = undefined> = TAdditional extends AnyObject ? T & TAdditional : T

export type BaseEmitterParams<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEmittery extends Emittery<any> = Emittery<any>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  BaseParams<{
    emittery: TEmittery
  }>,
  TAdditionalParams
>

export type BasicModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEmittery extends Emittery<{ moduleQueried: ModuleQueriedEventArgs }> = Emittery<{ moduleQueried: ModuleQueriedEventArgs }>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  BaseEmitterParams<
    TEmittery,
    {
      config: TConfig
    }
  >,
  TAdditionalParams
>

export type AccountModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEmittery extends Emittery<{ moduleQueried: ModuleQueriedEventArgs }> = Emittery<{ moduleQueried: ModuleQueriedEventArgs }>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  TEmittery,
  WithAdditional<
    {
      account: AccountInstance
    },
    TAdditionalParams
  >
>

export type WalletModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEmittery extends Emittery<{ moduleQueried: ModuleQueriedEventArgs }> = Emittery<{ moduleQueried: ModuleQueriedEventArgs }>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  TEmittery,
  WithAdditional<
    {
      accountDerivationPath: string
      wallet: XyoWalletBase
    },
    TAdditionalParams
  >
>

export type ModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEmittery extends Emittery<{ moduleQueried: ModuleQueriedEventArgs }> = Emittery<{ moduleQueried: ModuleQueriedEventArgs }>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> =
  | AccountModuleParams<TConfig, TEmittery, TAdditionalParams>
  | WalletModuleParams<TConfig, TEmittery, TAdditionalParams>
  | BasicModuleParams<TConfig, TEmittery, TAdditionalParams>
