import { XyoPayload } from '@xyo-network/payload'

import { XyoArchive } from '../../models'
import { XyoArchiveSchema } from './ArchiveListApiDivinerConfig'

export type ArchiveList = XyoPayload<
  {
    archive: XyoArchive
  },
  XyoArchiveSchema
>
