import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams } from '@xyo-network/core'
import { ModuleConfig, ModuleQueriedEventArgs } from '@xyo-network/module-model'
import { XyoWalletBase } from '@xyo-network/wallet'
import Emittery from 'emittery'

export type EventName = PropertyKey

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventData = Record<EventName, any>

export type WithAdditional<T, TAdditional extends AnyObject | undefined = undefined> = TAdditional extends AnyObject ? T & TAdditional : T

export type BaseEmitterParams<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  BaseParams<{
    emittery: Emittery<TEventData>
  }>,
  TAdditionalParams
>

export type BasicModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  BaseEmitterParams<
    TEventData,
    {
      config: TConfig
    }
  >,
  TAdditionalParams
>

export type AccountModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  TEventData,
  WithAdditional<
    {
      account: AccountInstance
    },
    TAdditionalParams
  >
>

export type WalletModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  TEventData,
  WithAdditional<
    {
      accountDerivationPath: string
      wallet: XyoWalletBase
    },
    TAdditionalParams
  >
>

export type ModuleEventData = EventData & { moduleQueried: ModuleQueriedEventArgs }

export type ModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEventData extends ModuleEventData = ModuleEventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> =
  | AccountModuleParams<TConfig, TEventData, TAdditionalParams>
  | WalletModuleParams<TConfig, TEventData, TAdditionalParams>
  | BasicModuleParams<TConfig, TEventData, TAdditionalParams>
