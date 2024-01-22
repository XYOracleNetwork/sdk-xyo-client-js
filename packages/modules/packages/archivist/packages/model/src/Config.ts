import { Address } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: Address[]
  read?: Address[]
  write?: Address[]
}

export const ArchivistConfigSchema = 'network.xyo.archivist.config'
export type ArchivistConfigSchema = typeof ArchivistConfigSchema

export type ArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends string | void = void> = ModuleConfig<
  WithAdditional<
    {
      /** @field address of one or more parent archivists to read from */
      parents?: ArchivistParents
      /** @field fail if some parents can not be resolved (true if unspecified) */
      requireAllParents?: boolean
      schema: TConfig extends Payload ? TConfig['schema'] : ArchivistConfigSchema
      /** @field should child store all reads from parents? */
      storeParentReads?: boolean
    },
    TConfig
  >,
  TSchema
>
