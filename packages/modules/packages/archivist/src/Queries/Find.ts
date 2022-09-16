import { XyoQuery } from '@xyo-network/module'

import { XyoPayloadFindFilter } from '../XyoPayloadFindFilter'

export type XyoArchivistFindQuerySchema = 'network.xyo.query.archivist.find'
export const XyoArchivistFindQuerySchema: XyoArchivistFindQuerySchema = 'network.xyo.query.archivist.find'

export type XyoArchivistFindQuery = XyoQuery<{
  schema: XyoArchivistFindQuerySchema
  filter?: XyoPayloadFindFilter
}>
