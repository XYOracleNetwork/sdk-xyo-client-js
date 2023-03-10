import { AnyObject } from '@xyo-network/core'
import { AddressString, ModuleConfig } from '@xyo-network/module-model'

export interface ArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type ArchivistConfigSchema = 'network.xyo.archivist.config'
export const ArchivistConfigSchema: ArchivistConfigSchema = 'network.xyo.archivist.config'

export type ArchivistConfig<TConfig extends AnyObject = AnyObject> = ModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: ArchivistParents
    schema: ArchivistConfigSchema
    /** @field should child store all reads from parents? */
    storeParentReads?: boolean
  } & TConfig
>
