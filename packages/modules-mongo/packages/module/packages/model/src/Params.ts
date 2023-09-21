import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { JobQueue } from '@xyo-network/node-core-model'
import { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { MongoDBModuleConfig } from './Config'

export type MongoDBModuleParams = ModuleParams<
  AnyConfigSchema<MongoDBModuleConfig>,
  {
    boundWitnessSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>) | undefined
    jobQueue?: JobQueue
    payloadSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>) | undefined
  }
>
