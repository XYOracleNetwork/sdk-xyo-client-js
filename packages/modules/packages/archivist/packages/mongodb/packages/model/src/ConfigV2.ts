import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ArchivistConfig } from '@xyo-network/archivist-model'

import type { MongoDBArchivistConfigSchema } from './Schema.ts'

export type MongoDBArchivistConfigV2 = ArchivistConfig<{
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBArchivistConfigSchema
}>
