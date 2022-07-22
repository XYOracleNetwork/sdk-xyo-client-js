import { XyoAccount } from '@xyo-network/account'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivist } from './XyoArchivist'

export interface XyoArchivistConfig<T extends XyoPayload = XyoPayload> {
  parent?: XyoArchivist<T>
  account?: XyoAccount
  cacheParentReads?: boolean
  writeThrough?: boolean
}

export class XyoArchivistConfigWrapper<T extends XyoPayload = XyoPayload, C extends XyoArchivistConfig<T> = XyoArchivistConfig<T>> {
  protected config?: C
  constructor(config?: C) {
    this.config = config
  }

  public get parent() {
    return this.config?.parent
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
