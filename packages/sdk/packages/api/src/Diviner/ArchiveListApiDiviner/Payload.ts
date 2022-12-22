import { XyoPayload } from '@xyo-network/payload-model'

import { XyoArchive } from '../../models'
import { XyoArchiveSchema } from './ArchiveListApiDivinerConfig'

export type ArchiveList = XyoPayload<
  {
    archive: XyoArchive
  },
  XyoArchiveSchema
>
