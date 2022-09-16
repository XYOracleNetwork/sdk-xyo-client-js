import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { PayloadArchivist } from './Archivist'

export interface XyoArchivistParents {
  read?: Record<string, PayloadArchivist | null | undefined>
  write?: Record<string, PayloadArchivist | null | undefined>
  commit?: Record<string, PayloadArchivist | null | undefined>
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
