import { AsyncQueryBusBaseConfig } from './BaseConfig'

export interface AsyncQueryBusHostConfig extends AsyncQueryBusBaseConfig {
  /**
   * The frequency at which the host should poll for new queries when no new queries have been received for a while
   */

  idlePollFrequency?: number

  /**
   * The threshold at which the host should consider itself idle and switch to the idle poll frequency
   */

  idleThreshold?: number

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
