import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { ArchivistApi } from '../Api/index.ts'

export const RemoteDivinerConfigSchema = 'network.xyo.diviner.remote.config' as const
export type RemoteDivinerConfigSchema = typeof RemoteDivinerConfigSchema

export type RemoteDivinerConfig = DivinerConfig & {
  /** @deprecated use in params instead */
  api?: ArchivistApi
  archive?: string
  schema: RemoteDivinerConfigSchema
}
