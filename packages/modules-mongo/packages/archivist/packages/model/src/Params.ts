import { ArchivistParams } from '@xyo-network/archivist-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { MongoDBArchivistConfig } from './Config'

export type MongoDBArchivistParams = ArchivistParams<
  AnyConfigSchema<MongoDBArchivistConfig>,
  {
    boundWitnessSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
    payloadSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
  }
>
