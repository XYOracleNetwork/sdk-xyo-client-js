import { CacheConfig } from '@xyo-network/bridge-model'
import { ModuleIdentifier } from '@xyo-network/module-model'

export const Pending = 'pending' as const
export type Pending = typeof Pending

/**
 * Configuration for searchable storage of local state
 */
export interface SearchableStorage {
  /**
   * Name/Address of the archivist where intermediate communications are stored
   */
  archivist: ModuleIdentifier
  /**
   * Name/Address of the diviner where intermediate communications are filtered
   */
  boundWitnessDiviner: ModuleIdentifier
}

export interface AsyncQueryBusClearingHouseConfig {
  /**
   * Configuration for intermediary query storage
   */
  queries?: SearchableStorage

  /**
   * Configuration for intermediary response storage
   */
  responses?: SearchableStorage
}

export interface AsyncQueryBusBaseConfig {
  clearingHouse?: AsyncQueryBusClearingHouseConfig

  /**
   * How often to poll for new queries/responses
   */
  pollFrequency?: number

  /**
   * Where the archivist should persist its internal state
   */
  stateStore?: SearchableStorage
}

export interface AsyncQueryBusClientConfig extends AsyncQueryBusBaseConfig {
  /**
   * Configuration for intermediary response storage
   */
  queryCache?: CacheConfig | true
}

export interface AsyncQueryBusHostConfig extends AsyncQueryBusBaseConfig {
  listeningModules?: string[]

  /**
   * How many queries to process at once when retrieving queries
   * for an address
   */
  perAddressBatchQueryLimit?: number
}
