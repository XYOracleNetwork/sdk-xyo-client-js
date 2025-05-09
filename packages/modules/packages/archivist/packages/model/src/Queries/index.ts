export * from './All.ts'
export * from './Clear.ts'
export * from './Commit.ts'
export * from './Delete.ts'
export * from './Get.ts'
export * from './Insert.ts'
export * from './Next.ts'
export * from './Snapshot.ts'

import type { ModuleQueries } from '@xyo-network/module-model'

import type { ArchivistAllQuery } from './All.ts'
import type { ArchivistClearQuery } from './Clear.ts'
import type { ArchivistCommitQuery } from './Commit.ts'
import type { ArchivistDeleteQuery } from './Delete.ts'
import type { ArchivistGetQuery } from './Get.ts'
import type { ArchivistInsertQuery } from './Insert.ts'
import type { ArchivistNextQuery } from './Next.ts'
import type { ArchivistSnapshotQuery } from './Snapshot.ts'

export type ArchivistQueries =
  | ArchivistAllQuery
  | ArchivistClearQuery
  | ArchivistCommitQuery
  | ArchivistDeleteQuery
  | ArchivistGetQuery
  | ArchivistInsertQuery
  | ArchivistNextQuery
  | ArchivistSnapshotQuery

export type ArchivistModuleQueries = ModuleQueries | ArchivistQueries
