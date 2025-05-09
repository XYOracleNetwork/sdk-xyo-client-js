import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { ModuleConfig, ModuleIdentifier } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

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

export const ArchivistConfigSchema = 'network.xyo.archivist.config' as const
export type ArchivistConfigSchema = typeof ArchivistConfigSchema

export type ArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
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
