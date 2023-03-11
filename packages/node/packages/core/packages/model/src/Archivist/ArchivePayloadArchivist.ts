import { ArchivistParams } from '@xyo-network/archivist'

import { PayloadArchivist } from './PayloadArchivist'

export type ArchivePayloadArchivist<TParams extends ArchivistParams = ArchivistParams> = PayloadArchivist<TParams>

export type ArchivePayloadArchivistFactory = (archive: string) => Promise<ArchivePayloadArchivist>
