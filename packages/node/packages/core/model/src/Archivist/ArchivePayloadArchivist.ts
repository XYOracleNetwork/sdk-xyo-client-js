import { XyoPayload } from '@xyo-network/payload-model'

import { PayloadArchivist } from './PayloadArchivist'

export type ArchivePayloadArchivist<T extends XyoPayload = XyoPayload> = PayloadArchivist<T>

export type ArchivePayloadArchivistFactory = (archive: string) => Promise<ArchivePayloadArchivist>
