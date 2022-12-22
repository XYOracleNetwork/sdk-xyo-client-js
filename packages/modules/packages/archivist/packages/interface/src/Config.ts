import { AbstractModuleConfig, AddressString } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

export interface ArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type ArchivistConfig<TConfig extends XyoPayload = XyoPayload> = AbstractModuleConfig<
  {
    cacheParentReads?: boolean
    /** @field address of one or more parent archivists to read from */
    parents?: ArchivistParents

    /** @field address of archivist to write through to */
    writeThrough?: string
  } & TConfig
>
