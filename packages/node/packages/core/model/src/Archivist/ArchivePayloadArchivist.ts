import { AbstractModuleConfig } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { PayloadArchivist } from './PayloadArchivist'

export type ArchivePayloadArchivist<
  T extends XyoPayload = XyoPayload,
  TConfig extends AbstractModuleConfig = AbstractModuleConfig,
> = PayloadArchivist<T, TConfig>

export type ArchivePayloadArchivistFactory = (archive: string) => Promise<ArchivePayloadArchivist>
