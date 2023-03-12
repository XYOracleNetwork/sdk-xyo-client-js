import { AddressString, ModuleConfig } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type ArchivistConfigSchema = 'network.xyo.archivist.config'
export const ArchivistConfigSchema: ArchivistConfigSchema = 'network.xyo.archivist.config'

export type ArchivistConfig<TConfig extends XyoPayload | undefined = undefined> = ModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: ArchivistParents
    schema: TConfig extends XyoPayload ? TConfig['schema'] : ArchivistConfigSchema
    /** @field should child store all reads from parents? */
    storeParentReads?: boolean
  } & Omit<TConfig, 'schema'>
>
