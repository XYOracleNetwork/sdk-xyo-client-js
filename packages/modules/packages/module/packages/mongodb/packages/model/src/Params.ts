import type { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import type { JobQueue } from '@xyo-network/shared'

import type { MongoDBModuleConfig } from './Config.ts'

export type MongoDBModuleParams = ModuleParams<
  AnyConfigSchema<MongoDBModuleConfig>,
  {
    boundWitnessSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>)
    jobQueue?: JobQueue
    payloadSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>)
  }
>
