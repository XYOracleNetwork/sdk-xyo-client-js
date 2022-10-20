import { AddressString, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export interface XyoArchivistParents {
  read?: AddressString[]
  write?: AddressString[]
  commit?: AddressString[]
}

export type XyoArchivistConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: XyoArchivistParents
    cacheParentReads?: boolean
    /** @field address of archivist to write through to */
    writeThrough?: string
  } & TConfig
>
