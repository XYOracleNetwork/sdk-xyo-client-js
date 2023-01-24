import { PayloadArchivist } from '@xyo-network/archivist'

export type ArchiveBoundWitnessArchivistFactory = (a: string) => Promise<PayloadArchivist>
