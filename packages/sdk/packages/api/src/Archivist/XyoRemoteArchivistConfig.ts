import { XyoArchivistConfig, XyoArchivistConfigWrapper } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivistApi } from './Api'

export type XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'
export const XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'

export type XyoRemoteArchivistConfig<T extends XyoPayload = XyoPayload> = XyoArchivistConfig<
  {
    schema: XyoRemoteArchivistConfigSchema
    api?: XyoArchivistApi
    archive?: string
  } & T
>

export class XyoRemoteArchivistConfigWrapper<
  T extends XyoPayload = XyoPayload,
  C extends XyoRemoteArchivistConfig<T> = XyoRemoteArchivistConfig<T>,
> extends XyoArchivistConfigWrapper<C> {
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
