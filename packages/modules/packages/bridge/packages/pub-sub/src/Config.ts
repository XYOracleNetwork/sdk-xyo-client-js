import { EmptyObject } from '@xylabs/object'
import { BridgeConfig, CacheConfig } from '@xyo-network/bridge-model'

import { PubSubBridgeSchema } from './Schema'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config`
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

/**
 * Configuration for searchable storage of local state
 */
export interface SearchableStorage<TArchivist = string, TDiviner = string> {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: TArchivist
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: TDiviner
}

/**
 * Configuration for the mutually accessible
 * modules between the modules being connected
 */
export interface Intermediary<TArchivist = string, TDiviner = string> {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: TArchivist
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: TDiviner
}

export interface AsyncQueryBusConfig<TArchivist = string, TDiviner = string> {
  /**
   * How many queries to process at once when retrieving queries
   * for an address
   */
  individualAddressBatchQueryLimit?: number

  listeningModules?: string[]

  /**
   * How often to poll for new queries/responses
   */
  pollFrequency?: number
  /**
   * Configuration for intermediary query storage
   */
  queries?: Intermediary<TArchivist, TDiviner>

  /**
   * Configuration for intermediary response storage
   */
  queryCache?: CacheConfig | true

  /**
   * Configuration for intermediary response storage
   */
  responses?: Intermediary<TArchivist, TDiviner>

  /**
   * The root address to connect the bridge to
   */
  rootAddress?: string

  /**
   * Where the archivist should persist its internal state
   */
  stateStore?: SearchableStorage<TArchivist, TDiviner>
}

/**
 * Configuration for the PubSubBridge
 */
export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  AsyncQueryBusConfig & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
