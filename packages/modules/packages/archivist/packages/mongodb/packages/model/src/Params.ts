import type { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { ArchivistParams } from '@xyo-network/archivist-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { MongoDBArchivistConfig } from './Config.js'

export type MongoDBArchivistParams = ArchivistParams<
  AnyConfigSchema<MongoDBArchivistConfig>,
  {
    boundWitnessSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
    payloadSdkConfig: BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>
  }
>
