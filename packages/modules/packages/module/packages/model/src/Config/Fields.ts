import type { LogLevel } from '@xylabs/logger'
import type { RetryConfig } from '@xylabs/retry'
import type { Schema } from '@xyo-network/payload-model'

import type { Labels } from '../Labels/index.ts'
import type { ModuleIdentifier, ModuleName } from '../ModuleIdentifier.ts'
import type { ModuleSecurityConfig } from './Security.ts'

export interface ModuleConfigFields {
  /** Limit to only these allowed queries */
  readonly allowedQueries?: Schema[]

  /** @field The name/address of the Archivist to use for this module */
  readonly archivist?: ModuleIdentifier

  /**
   * @field The labels used for this module. If a label is specified, then the
   * ModuleFactoryLocator will attempt to find a ModuleFactory with the corresponding
   * labels to construct this module.
   */
  readonly labels?: Labels

  readonly logLevel?: LogLevel

  /** @field Friendly name of module (not collision resistant). Can be used to resolve module when registered/attached to Node. */
  readonly name?: ModuleName

  /** @field paging settings for queries */
  readonly paging?: Record<string, { size?: number }>

  readonly retry?: RetryConfig

  /** @field The query schemas and allowed/disallowed addresses which are allowed to issue them against the module.
   * If both allowed and disallowed is specified, then disallowed takes priority. */
  readonly security?: ModuleSecurityConfig

  /** @field sign every query */
  readonly sign?: boolean

  /** @field Store the queries made to the module in an archivist if possible */
  readonly storeQueries?: boolean

  /** @field add a timestamp payload to every query  */
  readonly timestamp?: boolean
}
