import type { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { AnyConfigSchema, QueryableModuleParams } from '@xyo-network/module-model'
import type { JobQueue } from '@xyo-network/shared'

import type { MongoDBModuleConfig } from './Config.ts'

export interface MongoDBModuleParams extends QueryableModuleParams<AnyConfigSchema<MongoDBModuleConfig>> {
  boundWitnessSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>)
  jobQueue?: JobQueue
  payloadSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>)
}
