import { XyoQuery } from '@xyo-network/module'
import { XyoPayloadFindFilter } from '@xyo-network/payload'

export type XyoArchivistFindQuerySchema = 'network.xyo.query.archivist.find'
export const XyoArchivistFindQuerySchema: XyoArchivistFindQuerySchema = 'network.xyo.query.archivist.find'

export type XyoArchivistFindQuery = XyoQuery<{
  schema: XyoArchivistFindQuerySchema
  filter?: XyoPayloadFindFilter
}>
