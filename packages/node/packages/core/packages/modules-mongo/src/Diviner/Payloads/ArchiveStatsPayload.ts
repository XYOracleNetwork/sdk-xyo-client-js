import { Payload } from '@xyo-network/payload-model'

import { StatsSchema } from './StatsSchema'

export type ArchiveStatsPayload = Payload<{
  count: number
  schema: StatsSchema
}>
