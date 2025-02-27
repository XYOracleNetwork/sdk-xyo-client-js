import { ArchivistConfig } from '@xyo-network/archivist-model'

import { FirebaseArchivistSchema } from './Schema.ts'

export type FirebaseArchivistConfigSchema = `${FirebaseArchivistSchema}.config`
export const FirebaseArchivistConfigSchema: FirebaseArchivistConfigSchema = `${FirebaseArchivistSchema}.config`

export type FirebaseArchivistConfig = ArchivistConfig<{
  collection?: string
  dbId?: string
  schema: FirebaseArchivistConfigSchema
}>
