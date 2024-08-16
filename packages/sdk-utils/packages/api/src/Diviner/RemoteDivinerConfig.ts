import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { ArchivistApi } from '../Api/index.ts'

export type RemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'
export const RemoteDivinerConfigSchema: RemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config'

export type RemoteDivinerConfig = DivinerConfig & {
  /** @deprecated use in params instead */
  api?: ArchivistApi
  archive?: string
  schema: RemoteDivinerConfigSchema
}
