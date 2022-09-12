import { XyoModuleQuerySchema } from '@xyo-network/module'

import { XyoArchivistAllQuerySchema } from './All'
import { XyoArchivistClearQuerySchema } from './Clear'
import { XyoArchivistCommitQuerySchema } from './Commit'
import { XyoArchivistDeleteQuerySchema } from './Delete'
import { XyoArchivistFindQuerySchema } from './Find'
import { XyoArchivistGetQuerySchema } from './Get'
import { XyoArchivistInsertQuerySchema } from './Insert'

export type XyoArchivistQuerySchema<T extends string = never> =
  | XyoArchivistAllQuerySchema
  | XyoArchivistClearQuerySchema
  | XyoArchivistCommitQuerySchema
  | XyoArchivistDeleteQuerySchema
  | XyoArchivistFindQuerySchema
  | XyoArchivistGetQuerySchema
  | XyoArchivistInsertQuerySchema
  | XyoModuleQuerySchema
  | T
