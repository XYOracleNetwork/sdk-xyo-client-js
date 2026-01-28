import { asSchema, type Payload } from '@xyo-network/payload-model'

export const ArchivistStatsPayloadSchema = asSchema('network.xyo.archivist.stats', true)
export type ArchivistStatsPayloadSchema = typeof ArchivistStatsPayloadSchema

export type ArchivistStatsPayload
  = Payload<{ payloadCount: number }, ArchivistStatsPayloadSchema>
