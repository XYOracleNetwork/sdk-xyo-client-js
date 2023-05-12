export * from './All'
export * from './Clear'
export * from './Commit'
export * from './Delete'
export * from './Get'
export * from './Insert'

import { ModuleQuery, ModuleQueryBase, Query } from '@xyo-network/module-model'

import { ArchivistAllQuery } from './All'
import { ArchivistClearQuery } from './Clear'
import { ArchivistCommitQuery } from './Commit'
import { ArchivistDeleteQuery } from './Delete'
import { ArchivistGetQuery } from './Get'
import { ArchivistInsertQuery } from './Insert'

export type ArchivistQueryBase =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery

/**
 * @deprecated Use ArchivistQueryBase instead to
 * match naming convention
 */
export type ArchivistQueryRoot = ArchivistQueryBase

export type ArchivistModuleQueries = ModuleQueryBase | ArchivistQueryBase
export type ArchivistQuery<TQuery extends Query | void = void> = ModuleQuery<TQuery extends Query ? ArchivistQueryBase | TQuery : ArchivistQueryBase>
