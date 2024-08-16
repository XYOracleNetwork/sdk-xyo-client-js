import type { Query } from '@xyo-network/payload-model'

import type { ArchivistNextOptions } from '../NextOptions.ts'

export type ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'
export const ArchivistNextQuerySchema: ArchivistNextQuerySchema = 'network.xyo.query.archivist.next'

export type ArchivistNextQuery = Query<ArchivistNextOptions, ArchivistNextQuerySchema>
