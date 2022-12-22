import { XyoPayload } from '@xyo-network/payload-model'

import { StatsSchema } from './StatsSchema'

export type ArchiveStatsPayload = XyoPayload<{
  count: number
  schema: StatsSchema
}>
