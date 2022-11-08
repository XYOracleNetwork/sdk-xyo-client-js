import { XyoArchive } from '@xyo-network/api'
import { EntityArchive, User } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { MONGO_TYPES } from '../types'
import { getBaseMongoSdk } from './getBaseMongoSdk'

export const MongoSdkContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<BaseMongoSdk<Required<XyoArchive>>>(MONGO_TYPES.ArchiveSdkMongo).toConstantValue(getBaseMongoSdk<EntityArchive>(COLLECTIONS.Archives))
  bind<BaseMongoSdk<User>>(MONGO_TYPES.UserSdkMongo).toConstantValue(getBaseMongoSdk<User>(COLLECTIONS.Users))
})
