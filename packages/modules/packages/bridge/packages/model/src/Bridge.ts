import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import {
  AnyConfigSchema,
  Module,
  ModuleEventData,
  ModuleIdentifier,
  ModuleInstance,
  ModuleParams,
  ModuleResolverInstance,
} from '@xyo-network/module-model'

import { BridgeConfig } from './Config'
import { ExposedEventData, UnexposedEventData } from './EventModels'
import { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries'

export interface Bridge {
  expose: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<ModuleInstance[]>
  exposed?: () => Promisable<Address[]>
  unexpose?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<ModuleInstance[]>
}

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends ModuleParams<TConfig>,
    ModuleParams<TConfig> {
  resolver?: ModuleResolverInstance
}

export interface BridgeModuleEventData extends ExposedEventData, UnexposedEventData, ModuleEventData {}

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    Bridge,
    ModuleInstance<TParams, TEventData> {}
