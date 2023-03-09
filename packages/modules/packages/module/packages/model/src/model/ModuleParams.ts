import { AccountInstance } from '@xyo-network/account-model'
import { AnyObject, BaseParams } from '@xyo-network/core'
import { WalletInstance } from '@xyo-network/wallet-model'

import { ModuleEventData } from '../Events'
import { ModuleConfig } from './Config'
import { EventData } from './Module'

export type WithAdditional<T, TAdditional extends AnyObject | undefined = undefined> = TAdditional extends AnyObject ? T & TAdditional : T

export type EventDataParams<TParams extends BaseParams = BaseParams, TEventData extends EventData = AnyObject> = TParams & {
  eventData: TEventData
}

export type BasicModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = WithAdditional<
  EventDataParams<
    BaseParams<{
      config: TConfig
    }>,
    TEventData extends EventData ? TEventData | ModuleEventData : ModuleEventData
  >,
  TAdditionalParams
>

export type AccountModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
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
  TEventData extends EventData = EventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = BasicModuleParams<
  TConfig,
  TEventData,
  WithAdditional<
    {
      accountDerivationPath: string
      wallet: WalletInstance
    },
    TAdditionalParams
  >
>

export type ModuleParams<
  TConfig extends ModuleConfig = ModuleConfig,
  TEventData extends ModuleEventData = ModuleEventData,
  TAdditionalParams extends AnyObject | undefined = undefined,
> =
  | AccountModuleParams<TConfig, TEventData, TAdditionalParams>
  | WalletModuleParams<TConfig, TEventData, TAdditionalParams>
  | BasicModuleParams<TConfig, TEventData, TAdditionalParams>

export type ModuleParamsWithOptionalConfigSchema<TModuleParams extends ModuleParams> = Omit<TModuleParams, 'config'> & {
  config: Omit<TModuleParams['config'], 'schema'> & { schema?: TModuleParams['config']['schema'] }
}
