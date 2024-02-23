import { AsyncQueryBusBaseConfig } from './BaseConfig'

export interface AsyncQueryBusHostConfig extends AsyncQueryBusBaseConfig {
  /**
   * Modules that should be exposed via this host
   */

  listeningModules?: string[]

  /**
   * How many queries to process at once when retrieving queries
   * for an address
   */
  perAddressBatchQueryLimit?: number
}
