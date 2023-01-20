import { XyoArchive } from '@xyo-network/api'
import { Archivist } from '@xyo-network/archivist'

import { UpsertResult } from '../UpsertResult'
import { XyoPayloadFilterPredicate } from './XyoPayloadFilterPredicate'

export type EntityArchive = Required<XyoArchive>

export type ArchiveArchivist = Archivist<
  EntityArchive,
  EntityArchive & UpsertResult,
  EntityArchive,
  EntityArchive,
  XyoPayloadFilterPredicate<XyoArchive>,
  string
>
