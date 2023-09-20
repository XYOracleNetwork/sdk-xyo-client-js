import { AnyConfigSchema, ModuleParams } from '@xyo-network/module-model'
import { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { MongoDBModuleConfig } from './Config'

export type MongoDBModuleParams = ModuleParams<
  AnyConfigSchema<MongoDBModuleConfig>,
  {
    boundWitnessSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
    payloadSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
  }
>
