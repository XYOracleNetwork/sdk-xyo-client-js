import { RetryConfig } from '@xylabs/retry'

import { Labels } from '../Labels'
import { ModuleIdentifier, ModuleName } from '../ModuleIdentifier'
import { ModuleSecurityConfig } from './Security'

export interface ModuleConfigFields {
  /** @field The name/address of the Archivist to use for this module */
  readonly archivist?: ModuleIdentifier

  /**
   * @field The labels used for this module. If a label is specified, then the
   * ModuleFactoryLocator will attempt to find a ModuleFactory with the corresponding
   * labels to construct this module.
   */
  readonly labels?: Labels

  /** @field Friendly name of module (not collision resistent). Can be used to resolve module when registered/attached to Node. */
  readonly name?: ModuleName

  /** @field paging settings for queries */
  readonly paging?: Record<string, { size?: number }>

  readonly retry?: RetryConfig

  /** @field The query schemas and allowed/disallowed addresses which are allowed to issue them against the module. If both allowed and disallowed is specified, then disallowed takes priority. */
  readonly security?: ModuleSecurityConfig

  /** @field sign every query */
  readonly sign?: boolean

  /** @field Store the queries made to the module in an archivist if possible */
  readonly storeQueries?: boolean

  /** @field add a timestamp payload to every query  */
  readonly timestamp?: boolean
}
