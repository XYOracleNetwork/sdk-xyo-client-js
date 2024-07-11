import { Query } from '@xyo-network/payload-model'

import { ArchivistNextOptions } from '../NextOptions.js'

export type ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'
export const ArchivistNextQuerySchema: ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'

export type ArchivistNextQuery = Query<ArchivistNextOptions, ArchivistNextQuerySchema>
