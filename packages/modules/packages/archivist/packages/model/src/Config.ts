import { Address, WithAdditional } from '@xyo-network/core'
import { ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: Address[]
  read?: Address[]
  write?: Address[]
}

export type ArchivistConfigSchema = 'network.xyo.archivist.config'
export const ArchivistConfigSchema: ArchivistConfigSchema = 'network.xyo.archivist.config'

export type ArchivistConfig<TConfig extends Payload | undefined = undefined> = ModuleConfig<
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
    Omit<TConfig, 'schema'>
  >
>
