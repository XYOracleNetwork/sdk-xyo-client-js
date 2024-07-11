export * from './All.js'
export * from './Clear.js'
export * from './Commit.js'
export * from './Delete.js'
export * from './Get.js'
export * from './Insert.js'
export * from './Next.js'

import { ModuleQueries } from '@xyo-network/module-model'

import { ArchivistAllQuery } from './All.js'
import { ArchivistClearQuery } from './Clear.js'
import { ArchivistCommitQuery } from './Commit.js'
import { ArchivistDeleteQuery } from './Delete.js'
import { ArchivistGetQuery } from './Get.js'
import { ArchivistInsertQuery } from './Insert.js'
import { ArchivistNextQuery } from './Next.js'

export type ArchivistQueries =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery
  | ArchivistNextQuery

export type ArchivistModuleQueries = ModuleQueries | ArchivistQueries
