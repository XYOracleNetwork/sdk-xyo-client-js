import type { ArchivistConfig } from '@xyo-network/archivist-model'
import { asSchema } from '@xyo-network/payload-model'

import { FirebaseArchivistSchema } from './Schema.ts'

export const FirebaseArchivistConfigSchema = asSchema(`${FirebaseArchivistSchema}.config`, true)
export type FirebaseArchivistConfigSchema = typeof FirebaseArchivistConfigSchema

export type FirebaseArchivistConfig = ArchivistConfig<{
  collection?: string
  dbId?: string
  schema: FirebaseArchivistConfigSchema
}>
