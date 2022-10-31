import { AddressString, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export interface XyoArchivistParents {
  commit?: AddressString[]
  read?: AddressString[]
  write?: AddressString[]
}

export type XyoArchivistConfig<TConfig extends XyoPayload = XyoPayload> = XyoModuleConfig<
  {
    cacheParentReads?: boolean
    /** @field address of one or more parent archivists to read from */
    parents?: XyoArchivistParents

    /** @field address of archivist to write through to */
    writeThrough?: string
  } & TConfig
>
