import type { BaseMongoSdk, BaseMongoSdkConfig } from '@xylabs/mongo'
import type { PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'

export interface MongoDBModuleV2 {
  get payloadSdkConfig(): BaseMongoSdkConfig
  get payloads(): BaseMongoSdk<PayloadWithMongoMeta>
}
