import type { BaseMongoSdkPrivateConfig, BaseMongoSdkPublicConfig } from '@xylabs/mongo'
import type { AnyConfigSchema, QueryableModuleParams } from '@xyo-network/module-model'
import type { JobQueue } from '@xyo-network/shared'

import type { MongoDBModuleConfigV2 } from './ConfigV2.ts'

export interface MongoDBModuleParamsV2<TConfig extends AnyConfigSchema<MongoDBModuleConfigV2> = AnyConfigSchema<MongoDBModuleConfigV2>>
  extends QueryableModuleParams<TConfig>
{
  jobQueue?: JobQueue
  payloadSdkConfig?: (BaseMongoSdkPrivateConfig & Partial<BaseMongoSdkPublicConfig>)
}
