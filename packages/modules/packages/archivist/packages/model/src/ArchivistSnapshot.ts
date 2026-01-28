import type { Hash } from '@xylabs/sdk-js'
import {
  asSchema, type Payload, type PayloadHashMap,
} from '@xyo-network/payload-model'

export const ArchivistSnapshotPayloadSchema = asSchema('network.xyo.archivist.snapshot', true)
export type ArchivistSnapshotPayloadSchema = typeof ArchivistSnapshotPayloadSchema

export type ArchivistSnapshotPayload<TPayload extends Payload = Payload, TId extends string | number | symbol = Hash>
  = Payload<PayloadHashMap<TPayload, TId>, ArchivistSnapshotPayloadSchema>
