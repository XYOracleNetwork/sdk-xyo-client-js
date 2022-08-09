import { XyoArchivistConfig, XyoArchivistConfigWrapper } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivistApi } from './Api'

export interface XyoRemoteArchivistConfig<T extends XyoPayload = XyoPayload> extends XyoArchivistConfig<T> {
  api?: XyoArchivistApi
  archive?: string
}

export class XyoRemoteArchivistConfigWrapper<
  T extends XyoPayload = XyoPayload,
  C extends XyoRemoteArchivistConfig<T> = XyoRemoteArchivistConfig<T>,
> extends XyoArchivistConfigWrapper<T, C> {
  constructor(config?: C) {
    super(config)
  }

  public get api() {
    return this.config?.api
  }

  public get archive() {
    return this.config?.archive
  }
}
