import { PayloadArchivist } from '@xyo-network/archivist'

export type ArchivePayloadArchivistFactory = (archive: string) => Promise<PayloadArchivist>
