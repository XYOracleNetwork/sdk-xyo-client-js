import { DivinerConfig } from '@xyo-network/diviner'

import { XyoArchivistApi } from '../Api'

export type XyoRemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'
export const XyoRemoteDivinerConfigSchema: XyoRemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'

export type XyoRemoteDivinerConfig = DivinerConfig & {
  /** @deprecated use in params instead */
  api?: XyoArchivistApi
  archive?: string
  schema: XyoRemoteDivinerConfigSchema
}
