import { ArchivistConfig } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoArchivistApi } from '../Api'

export type XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'
export const XyoRemoteArchivistConfigSchema: XyoRemoteArchivistConfigSchema = 'network.xyo.archivist.remote.config'

export type XyoRemoteArchivistConfig<T extends XyoPayload = XyoPayload> = ArchivistConfig<
  {
    /** @deprecated pass api in params instead */
    api?: XyoArchivistApi
    archive?: string
    schema: XyoRemoteArchivistConfigSchema
  } & T
>
