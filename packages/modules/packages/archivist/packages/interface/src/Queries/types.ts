import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoArchivistAllQuery } from './All'
import { XyoArchivistClearQuery } from './Clear'
import { XyoArchivistCommitQuery } from './Commit'
import { XyoArchivistDeleteQuery } from './Delete'
import { XyoArchivistFindQuery } from './Find'
import { XyoArchivistGetQuery } from './Get'
import { XyoArchivistInsertQuery } from './Insert'

export type XyoArchivistQueryRoot =
  | XyoArchivistAllQuery
  | XyoArchivistClearQuery
  | XyoArchivistCommitQuery
  | XyoArchivistDeleteQuery
  | XyoArchivistFindQuery
  | XyoArchivistGetQuery
  | XyoArchivistInsertQuery

export type XyoArchivistQuery<TQuery extends XyoQuery | void = void> = AbstractModuleQuery<
  TQuery extends XyoQuery ? XyoArchivistQueryRoot | TQuery : XyoArchivistQueryRoot
>
