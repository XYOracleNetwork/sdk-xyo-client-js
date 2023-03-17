import { PayloadWithMeta, User, XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { MONGO_TYPES } from '../mongoTypes'
import { getBaseMongoSdk } from './getBaseMongoSdk'

export const SdkContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  const boundWitnessSdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const payloadSdk = getBaseMongoSdk<PayloadWithMeta>(COLLECTIONS.Payloads)
  const userSdk = getBaseMongoSdk<User>(COLLECTIONS.Users)

  bind<BaseMongoSdk<XyoBoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk).toConstantValue(boundWitnessSdk)
  bind<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk).toConstantValue(payloadSdk)
  bind<BaseMongoSdk<User>>(MONGO_TYPES.UserSdk).toConstantValue(userSdk)
})
