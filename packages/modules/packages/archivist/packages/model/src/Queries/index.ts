export * from './All.ts'
export * from './Clear.ts'
export * from './Commit.ts'
export * from './Delete.ts'
export * from './Get.ts'
export * from './Insert.ts'
export * from './Next.ts'

import { ModuleQueries } from '@xyo-network/module-model'

import { ArchivistAllQuery } from './All.ts'
import { ArchivistClearQuery } from './Clear.ts'
import { ArchivistCommitQuery } from './Commit.ts'
import { ArchivistDeleteQuery } from './Delete.ts'
import { ArchivistGetQuery } from './Get.ts'
import { ArchivistInsertQuery } from './Insert.ts'
import { ArchivistNextQuery } from './Next.ts'

export type ArchivistQueries =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery
  | ArchivistNextQuery

export type ArchivistModuleQueries = ModuleQueries | ArchivistQueries
