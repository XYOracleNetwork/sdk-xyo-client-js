import { XyoPayload } from '@xyo-network/payload'

import { StatsSchema } from './StatsSchema'

export type ArchiveStatsPayload = XyoPayload<{
  count: number
  schema: StatsSchema
}>
