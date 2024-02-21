export * from './All'
export * from './Clear'
export * from './Commit'
export * from './Delete'
export * from './Get'
export * from './Insert'
export * from './Next'

import { ModuleQueries } from '@xyo-network/module-model'

import { ArchivistAllQuery } from './All'
import { ArchivistClearQuery } from './Clear'
import { ArchivistCommitQuery } from './Commit'
import { ArchivistDeleteQuery } from './Delete'
import { ArchivistGetQuery } from './Get'
import { ArchivistInsertQuery } from './Insert'
import { ArchivistNextQuery } from './Next'

export type ArchivistQueries =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery
  | ArchivistNextQuery

export type ArchivistModuleQueries = ModuleQueries | ArchivistQueries
