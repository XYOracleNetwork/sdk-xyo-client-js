import { AddressString, ModuleConfig } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type ArchivistConfigSchema = 'network.xyo.archivist.config'
export const ArchivistConfigSchema: ArchivistConfigSchema = 'network.xyo.archivist.config'

export type ArchivistConfig<TConfig extends Payload | void = void> = ModuleConfig<
  TConfig,
  {
    /** @field address of one or more parent archivists to read from */
    parents?: ArchivistParents
    /** @field fail if some parents can not be resolved (true if unspecified) */
    requireAllParents?: boolean
    /** @field should child store all reads from parents? */
    storeParentReads?: boolean
  },
  TConfig extends Payload ? TConfig['schema'] : ArchivistConfigSchema
>
