import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ModuleConfig } from '@xyo-network/module-model'

import type { MongoDBModuleConfigSchema } from './Schema.ts'

export type MongoDBModuleConfigV2 = ModuleConfig<{
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBModuleConfigSchema
}>
