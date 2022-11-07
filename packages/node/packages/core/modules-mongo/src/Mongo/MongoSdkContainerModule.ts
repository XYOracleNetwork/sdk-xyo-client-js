import { XyoArchive, XyoArchiveKey } from '@xyo-network/api'
import { EntityArchive, User, XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { MONGO_TYPES } from '../types'
import { getBaseMongoSdk } from './getBaseMongoSdk'

export const MongoSdkContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<BaseMongoSdk<Required<XyoArchive>>>(MONGO_TYPES.ArchiveSdkMongo).toConstantValue(getBaseMongoSdk<EntityArchive>(COLLECTIONS.Archives))
  bind<BaseMongoSdk<XyoArchiveKey>>(MONGO_TYPES.ArchiveKeySdkMongo).toConstantValue(getBaseMongoSdk<XyoArchiveKey>(COLLECTIONS.ArchiveKeys))
  bind<BaseMongoSdk<XyoPayloadWithMeta>>(MONGO_TYPES.PayloadSdkMongo).toConstantValue(getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads))
  bind<BaseMongoSdk<XyoBoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdkMongo).toConstantValue(
    getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses),
  )
  bind<BaseMongoSdk<User>>(MONGO_TYPES.UserSdkMongo).toConstantValue(getBaseMongoSdk<User>(COLLECTIONS.Users))
})
