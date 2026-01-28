import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import type { ArchivistApi } from '../Api/index.ts'

export const RemoteDivinerConfigSchema = asSchema('network.xyo.diviner.remote.config', true)
export type RemoteDivinerConfigSchema = typeof RemoteDivinerConfigSchema

export type RemoteDivinerConfig = DivinerConfig & {
  /** @deprecated use in params instead */
  api?: ArchivistApi
  archive?: string
  schema: RemoteDivinerConfigSchema
}
