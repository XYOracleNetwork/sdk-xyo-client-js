import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ArchivistConfig } from '@xyo-network/archivist-model'

import type { MongoDBArchivistConfigSchema } from './Schema.js'

export type MongoDBArchivistConfig = ArchivistConfig<{
  boundWitnessSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBArchivistConfigSchema
}>
