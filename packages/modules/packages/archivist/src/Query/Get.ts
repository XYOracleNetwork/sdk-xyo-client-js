import { XyoQueryPayload } from '@xyo-network/module'

export type XyoArchivistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'
export const XyoArchivistGetQueryPayloadSchema: XyoArchivistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'

export type XyoArchivistGetQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistGetQueryPayloadSchema
  hashes: string[]
}>
