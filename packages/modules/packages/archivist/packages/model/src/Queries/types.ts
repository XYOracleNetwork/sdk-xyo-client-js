import { ModuleQuery, XyoQuery } from '@xyo-network/module-model'

import { ArchivistAllQuery } from './All'
import { ArchivistClearQuery } from './Clear'
import { ArchivistCommitQuery } from './Commit'
import { ArchivistDeleteQuery } from './Delete'
import { ArchivistGetQuery } from './Get'
import { ArchivistInsertQuery } from './Insert'

export type ArchivistQueryRoot =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery

export type ArchivistQuery<TQuery extends XyoQuery | void = void> = ModuleQuery<
  TQuery extends XyoQuery ? ArchivistQueryRoot | TQuery : ArchivistQueryRoot
>
