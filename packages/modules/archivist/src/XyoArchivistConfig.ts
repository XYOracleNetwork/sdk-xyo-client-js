import { XyoAccount } from '@xyo-network/account'
import { XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivist, XyoArchivistQueryPayload } from './XyoArchivist'

export interface XyoArchivistParents {
  read?: string[]
  write?: string[]
  commit?: string[]
}

export interface XyoResolvedArchivistParents {
  read?: (XyoArchivist | null)[]
  write?: (XyoArchivist | null)[]
  commit?: (XyoArchivist | null)[]
}

export type XyoArchivistConfig<
  T extends XyoPayload = XyoPayload,
  M extends XyoArchivist = XyoArchivist<XyoArchivistQueryPayload<T>>,
> = XyoModuleConfig<
  {
    /** @field address of one or more parent archivists to read from */
    parents?: XyoArchivistParents
    account?: XyoAccount
    cacheParentReads?: boolean
    /** @field address of archivist to write through to */
    writeThrough?: string
  } & T,
  M
>

export class XyoArchivistConfigWrapper<C extends XyoArchivistConfig = XyoArchivistConfig> {
  protected config?: C
  constructor(config?: C) {
    this.config = config
  }

  public get parents() {
    return this.config?.parents
  }

  public get account() {
    return this.config?.account
  }

  public get writeThrough() {
    return this.config?.writeThrough
  }

  public get cacheParentReads() {
    return this.config?.cacheParentReads
  }
}
