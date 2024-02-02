import { EmptyObject } from '@xylabs/object'
import { BridgeConfig, CacheConfig } from '@xyo-network/bridge-model'

import { PubSubBridgeSchema } from './Schema'

export const PubSubBridgeConfigSchema = `${PubSubBridgeSchema}.config`
export type PubSubBridgeConfigSchema = typeof PubSubBridgeConfigSchema

/**
 * Configuration for searchable storage of local state
 */
export interface SearchableStorage {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: string
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: string
}

/**
 * Configuration for the mutually accessible
 * modules between the modules being connected
 */
export interface IntermediaryConfig {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: string
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: string
}

/**
 * Configuration for the PubSubBridge
 */
export type PubSubBridgeConfig<TConfig extends EmptyObject = EmptyObject, TSchema extends string | void = void> = BridgeConfig<
  {
    /**
     * How many queries to process at once when retrieving queries
     * for an address
     */
    individualAddressBatchQueryLimit?: number
    /**
     * How often to poll for new queries/responses
     */
    pollFrequency?: number
    /**
     * Configuration for intermediary query storage
     */
    queries?: IntermediaryConfig

    /**
     * Configuration for intermediary response storage
     */
    queryCache?: CacheConfig | true

    /**
     * Configuration for intermediary response storage
     */
    responses?: IntermediaryConfig

    /**
     * The root address to connect the bridge to
     */
    rootAddress?: string

    /**
     * The configurations schema for the module
     */
    schema: PubSubBridgeConfigSchema

    /**
     * Where the archivist should persist its internal state
     */
    stateStore?: SearchableStorage
  } & TConfig,
  TSchema extends string ? TSchema : PubSubBridgeConfigSchema
>
