import { XyoModuleQueryPayload } from '@xyo-network/module'

import { XyoArchivistAllQueryPayload } from './All'
import { XyoArchivistClearQueryPayload } from './Clear'
import { XyoArchivistCommitQueryPayload } from './Commit'
import { XyoArchivistDeleteQueryPayload } from './Delete'
import { XyoArchivistFindQueryPayload } from './Find'
import { XyoArchivistGetQueryPayload } from './Get'
import { XyoArchivistInsertQueryPayload } from './Insert'

export type XyoArchivistQueryPayload<T extends string = never> =
  | XyoArchivistAllQueryPayload
  | XyoArchivistClearQueryPayload
  | XyoArchivistCommitQueryPayload
  | XyoArchivistDeleteQueryPayload
  | XyoArchivistFindQueryPayload
  | XyoArchivistGetQueryPayload
  | XyoArchivistInsertQueryPayload
  | XyoModuleQueryPayload
  | T
