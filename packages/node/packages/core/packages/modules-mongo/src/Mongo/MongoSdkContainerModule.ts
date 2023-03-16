import { User, XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { MONGO_TYPES } from '../mongoTypes'
import { getBaseMongoSdk } from './getBaseMongoSdk'

export const MongoSdkContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<BaseMongoSdk<XyoBoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk).toConstantValue(
    getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses),
  )
  bind<BaseMongoSdk<XyoPayloadWithMeta>>(MONGO_TYPES.PayloadSdk).toConstantValue(getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads))
  bind<BaseMongoSdk<User>>(MONGO_TYPES.PayloadSdk).toConstantValue(getBaseMongoSdk<User>(COLLECTIONS.Users))
})
