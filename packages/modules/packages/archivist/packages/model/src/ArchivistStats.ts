import type { Payload } from '@xyo-network/payload-model'

export const ArchivistStatsPayloadSchema = 'network.xyo.archivist.stats' as const
export type ArchivistStatsPayloadSchema = typeof ArchivistStatsPayloadSchema

export type ArchivistStatsPayload
  = Payload<{ payloadCount: number }, ArchivistStatsPayloadSchema>
