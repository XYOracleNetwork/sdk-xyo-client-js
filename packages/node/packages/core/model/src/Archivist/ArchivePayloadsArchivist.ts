import { XyoPayload } from '@xyo-network/payload-model'

import { PayloadArchivist } from './PayloadArchivist'

export type ArchivePayloadsArchivist<T extends XyoPayload = XyoPayload> = PayloadArchivist<T>

export type ArchivePayloadsArchivistFactory = (archive: string) => ArchivePayloadsArchivist
