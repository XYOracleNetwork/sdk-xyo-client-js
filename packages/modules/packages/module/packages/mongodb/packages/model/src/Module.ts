import type { BaseMongoSdk, BaseMongoSdkConfig } from '@xylabs/mongo'
import type { BoundWitnessWithMongoMeta, PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'

export interface MongoDBModule {
  get boundWitnessSdkConfig(): BaseMongoSdkConfig
  get boundWitnesses(): BaseMongoSdk<BoundWitnessWithMongoMeta>
  get payloadSdkConfig(): BaseMongoSdkConfig
  get payloads(): BaseMongoSdk<PayloadWithMongoMeta>
}
