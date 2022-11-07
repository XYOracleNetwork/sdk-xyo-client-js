import { XyoArchiveKey } from '@xyo-network/api'
import { Archivist } from '@xyo-network/archivist'

export type ArchiveKeyArchivist = Archivist<XyoArchiveKey, XyoArchiveKey, XyoArchiveKey, XyoArchiveKey, Partial<XyoArchiveKey>, string>
