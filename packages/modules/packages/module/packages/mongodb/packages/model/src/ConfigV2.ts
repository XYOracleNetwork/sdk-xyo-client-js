import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ModuleConfig } from '@xyo-network/module-model'

import type { MongoDBModuleConfigSchema } from './Schema.ts'

export type MongoDBModuleConfigV2 = ModuleConfig<{
  /**
   * The maximum number of payloads to store in the archivist.
   * If not specified, there is no limit. If specified, the archivist
   * will automatically clear old payloads when the limit is reached
   * in a LIFO fashion.
   */
  max?: number
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBModuleConfigSchema
}>
