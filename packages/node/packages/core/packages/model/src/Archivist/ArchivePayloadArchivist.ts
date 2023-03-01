import { ArchivistParams } from '@xyo-network/archivist'
import { XyoPayload } from '@xyo-network/payload-model'

import { PayloadArchivist } from './PayloadArchivist'

export type ArchivePayloadArchivist<T extends XyoPayload = XyoPayload, TParams extends ArchivistParams = ArchivistParams> = PayloadArchivist<
  T,
  TParams
>

export type ArchivePayloadArchivistFactory = (archive: string) => Promise<ArchivePayloadArchivist>
