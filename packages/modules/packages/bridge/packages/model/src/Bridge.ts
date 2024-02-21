import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import {
  AnyConfigSchema,
  ModuleConfig,
  ModuleEventData,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleParams,
  ModuleQueryResult,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import { Payload, Query } from '@xyo-network/payload-model'

import { BridgeConfig } from './Config'

export interface Bridge {
  connect: () => Promisable<boolean>
  connected: boolean
  disconnect: () => Promisable<boolean>
}

export interface BridgeParams<TConfig extends AnyConfigSchema<BridgeConfig> = AnyConfigSchema<BridgeConfig>>
  extends ModuleParams<TConfig>,
    ModuleParams<TConfig> {}

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends ModuleInstance<TParams, TEventData> {
  /**
   * Returns the address of the base module that the bridge is connected to. Since discovery can be
   * a recursive process, the root module is the module that the bridge is directly connected to even
   * though its children (through potentially several generations) are also able to be communicated to
   * across the bridge.
   */
  getRootAddress(): Promisable<Address>

  /**
   * Returns the config for a bridged module
   * @param address Address of the module connected to the bridge
   */
  targetConfig(address: Address): ModuleConfig

  /**
   * Returns the result of a discover query for a bridged module
   * @param address Address of the module connected to the bridge
   * @param maxDepth
   */
  targetDiscover(address?: string, maxDepth?: number): Promisable<Payload[]>

  /**
   *
   * @param address Address of the module connected to the bridge
   */
  targetDownResolver(address?: string): ModuleResolverInstance | undefined

  /**
   * Returns the result of a manifest query for a bridged module
   * @param address Address of the module connected to the bridge
   * @param maxDepth
   */
  targetManifest(address?: string, maxDepth?: number): Promisable<ModuleManifestPayload>

  /**
   * Returns the supported queries for a bridged module
   * @param address Address of the module connected to the bridge
   */
  targetQueries(address: Address): string[]

  /**
   * Queries a module connected to the bridge using the supplied query, payloads, and query configuration
   * @param address Address of the module connected to the bridge
   * @param query The query to issue against the address
   * @param payloads The payloads to use in the query
   */
  targetQuery(address: Address, query: Query, payloads?: Payload[]): Promisable<ModuleQueryResult>

  /**
   * Determines if a bridged module is queryable using the supplied query, payloads, and query configuration
   * @param address Address of the module connected to the bridge
   * @param query The query to issue against the address
   * @param payloads The payloads to use in the query
   * @param queryConfig The query configuration
   */
  targetQueryable(address: Address, query: QueryBoundWitness, payloads?: Payload[], queryConfig?: ModuleConfig): Promisable<boolean>

  /**
   *
   * @param address Address of the module potentially connected to the bridge
   * @param filter
   * @param options
   */
  targetResolve(address: Address, filter?: ModuleFilter, options?: ModuleFilterOptions): Promisable<ModuleInstance[]>
  /**
   *
   * @param address Address of the module potentially connected to the bridge
   * @param nameOrAddress
   * @param options
   */
  targetResolve(address: Address, nameOrAddress: string, options?: ModuleFilterOptions): Promisable<ModuleInstance | undefined>
  /**
   *
   * @param address Address of the module potentially connected to the bridge
   * @param nameOrAddressOrFilter
   * @param options
   */
  targetResolve(
    address: Address,
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promisable<ModuleInstance | ModuleInstance[] | undefined>
}

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends ModuleEventData = ModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    Bridge {}
