import { XyoArchivistConfig } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload'

import { XyoArchivistApi } from './Api'

export type XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'
export const XyoRemoteArchivistConfigSchema: XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'

export type XyoRemoteArchivistConfig<T extends XyoPayload = XyoPayload> = XyoArchivistConfig<
  {
    schema: XyoRemoteArchivistConfigSchema
    api?: XyoArchivistApi
    archive?: string
  } & T
>
