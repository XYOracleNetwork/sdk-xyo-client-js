import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ModuleConfig, ModuleIdentifier } from '@xyo-network/module-model'
import type {
  Payload,
  Schema,
} from '@xyo-network/payload-model'
import { asSchema } from '@xyo-network/payload-model'

import type { IndexDescription } from './IndexDescription.ts'

export interface ArchivistParents {
  commit?: ModuleIdentifier[]
  read?: ModuleIdentifier[]
  write?: ModuleIdentifier[]
}

export interface ArchivistStorage {
  /** The indexes to create on the object store */
  indexes?: IndexDescription[]
}

export interface ArchivistGetCache {
  enabled?: boolean
  maxEntries?: number
}

export const ArchivistConfigSchema = asSchema('network.xyo.archivist.config', true)
export type ArchivistConfigSchema = typeof ArchivistConfigSchema

export type ArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends Schema | void = void> = ModuleConfig<
  WithAdditional<
    {
      /** @field caching configuration for get calls */
      getCache?: ArchivistGetCache
      /** @field address of one or more parent archivists to read from */
      parents?: ArchivistParents
      /** @field fail if some parents can not be resolved (true if unspecified) */
      requireAllParents?: boolean
      schema: TConfig extends Payload ? TConfig['schema'] : ArchivistConfigSchema
      /** @field storage configuration */
      storage?: ArchivistStorage
      /** @field should child store all reads from parents? */
      storeParentReads?: boolean
    },
    TConfig
  >,
  TSchema
>
