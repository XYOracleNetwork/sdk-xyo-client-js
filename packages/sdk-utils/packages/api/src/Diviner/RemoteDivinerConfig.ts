import { DivinerConfig } from '@xyo-network/diviner-model'

import { ArchivistApi } from '../Api'

export type RemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'
export const RemoteDivinerConfigSchema: RemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'

export type RemoteDivinerConfig = DivinerConfig & {
  /** @deprecated use in params instead */
  api?: ArchivistApi
  archive?: string
  schema: RemoteDivinerConfigSchema
}
