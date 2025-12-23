import type { Hash } from '@xylabs/sdk-js'
import type { Payload, PayloadHashMap } from '@xyo-network/payload-model'

export const ArchivistSnapshotPayloadSchema = 'network.xyo.archivist.snapshot' as const
export type ArchivistSnapshotPayloadSchema = typeof ArchivistSnapshotPayloadSchema

export type ArchivistSnapshotPayload<TPayload extends Payload = Payload, TId extends string | number | symbol = Hash>
  = Payload<PayloadHashMap<TPayload, TId>, ArchivistSnapshotPayloadSchema>
