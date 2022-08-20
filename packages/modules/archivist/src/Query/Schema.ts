import { XyoModuleQueryPayloadSchema } from '@xyo-network/module'

import { XyoArchivistAllQueryPayloadSchema } from './All'
import { XyoArchivistClearQueryPayloadSchema } from './Clear'
import { XyoArchivistCommitQueryPayloadSchema } from './Commit'
import { XyoArchivistDeleteQueryPayloadSchema } from './Delete'
import { XyoArchivistFindQueryPayloadSchema } from './Find'
import { XyoArchivistGetQueryPayloadSchema } from './Get'
import { XyoArchivistInsertQueryPayloadSchema } from './Insert'

export type XyoArchivistQueryPayloadSchema =
  | XyoArchivistAllQueryPayloadSchema
  | XyoArchivistClearQueryPayloadSchema
  | XyoArchivistCommitQueryPayloadSchema
  | XyoArchivistDeleteQueryPayloadSchema
  | XyoArchivistFindQueryPayloadSchema
  | XyoArchivistGetQueryPayloadSchema
  | XyoArchivistInsertQueryPayloadSchema
  | XyoModuleQueryPayloadSchema
