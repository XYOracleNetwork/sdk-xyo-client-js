import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoArchivistAllQuery } from './All'
import { XyoArchivistClearQuery } from './Clear'
import { XyoArchivistCommitQuery } from './Commit'
import { XyoArchivistDeleteQuery } from './Delete'
import { XyoArchivistFindQuery } from './Find'
import { XyoArchivistGetQuery } from './Get'
import { XyoArchivistInsertQuery } from './Insert'

type XyoArchivistQueryRoot =
  | XyoModuleQuery
  | XyoArchivistAllQuery
  | XyoArchivistClearQuery
  | XyoArchivistCommitQuery
  | XyoArchivistDeleteQuery
  | XyoArchivistFindQuery
  | XyoArchivistGetQuery
  | XyoArchivistInsertQuery

type XyoArchivistQueryRootSchema = XyoArchivistQueryRoot['schema']

export type XyoArchivistQuerySchema<T extends string | void = void> = T extends string ? XyoArchivistQueryRootSchema | T : XyoArchivistQueryRootSchema

export type XyoArchivistQuery<T extends XyoQuery | void = void> = T extends XyoQuery ? XyoArchivistQueryRoot | T : XyoArchivistQueryRoot
