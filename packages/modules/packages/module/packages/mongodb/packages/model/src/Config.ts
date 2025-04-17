import type { BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ModuleConfig } from '@xyo-network/module-model'

import type { MongoDBModuleConfigSchema } from './Schema.ts'

export type MongoDBModuleConfig = ModuleConfig<{
  boundWitnessSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  payloadSdkConfig?: Partial<BaseMongoSdkPublicConfig>
  schema: MongoDBModuleConfigSchema
}>
