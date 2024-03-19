import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AnyConfigSchema, Module, ModuleEventData, ModuleIdentifier, ModuleInstance, ModuleParams, ModuleResolver } from '@xyo-network/module-model'

import { BridgeConfig } from './Config'
import { ExposedEventData, UnexposedEventData } from './EventModels'
import { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries'

export interface Bridge {
  connect?: () => Promisable<boolean>
  connected?: boolean
  disconnect?: () => Promisable<boolean>
  expose: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<Address[]>
  unexpose?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<Address[]>
}

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends ModuleParams<TConfig>,
    ModuleParams<TConfig> {
  resolver?: ModuleResolver
}

export interface BridgeModuleEventData extends ExposedEventData, UnexposedEventData, ModuleEventData {}

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    Bridge,
    ModuleInstance<TParams, TEventData> {}
