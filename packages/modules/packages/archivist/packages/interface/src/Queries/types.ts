import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module'

import { ArchivistAllQuery } from './All'
import { ArchivistClearQuery } from './Clear'
import { ArchivistCommitQuery } from './Commit'
import { ArchivistDeleteQuery } from './Delete'
import { ArchivistFindQuery } from './Find'
import { ArchivistGetQuery } from './Get'
import { ArchivistInsertQuery } from './Insert'

export type ArchivistQueryRoot =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistFindQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery

export type ArchivistQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? ArchivistQueryRoot | TQuery : ArchivistQueryRoot
>
