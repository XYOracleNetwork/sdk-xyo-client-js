import type { Address } from '@xylabs/sdk-js'
import type { Schema } from '@xyo-network/payload-model'

export type CosigningAddressSet = Address[]

export interface ModuleSecurityConfig {
  /** @field Will the module process queries that have unsigned BoundWitness in query tuples */
  readonly allowAnonymous?: boolean

  /** @field If schema in record, then only these address sets can access query */
  readonly allowed?: Record<Schema, (Address | CosigningAddressSet)[]>

  /** @field If schema in record, then anyone except these addresses can access query */
  readonly disallowed?: Record<Schema, Address[]>
}
