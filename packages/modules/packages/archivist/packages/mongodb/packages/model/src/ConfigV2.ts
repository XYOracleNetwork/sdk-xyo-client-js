import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ArchivistConfig } from '@xyo-network/archivist-model'

import type { MongoDBArchivistConfigSchema } from './Schema.ts'

export type MongoDBArchivistConfigV2 = ArchivistConfig<{
  /**
   * The maximum number of payloads to store in the archivist.
   * If not specified, there is no limit. If specified, the archivist
   * will automatically clear old payloads when the limit is reached
   * in a LIFO fashion.
   */
  max?: number
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBArchivistConfigSchema
}>
