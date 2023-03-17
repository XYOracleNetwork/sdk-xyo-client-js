import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveModuleConfigSchema, PayloadWithMeta, User, UserArchivist, XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

let userArchivist: MongoDBUserArchivist
let archivist: MongoDBDeterministicArchivist

const getMongoDBUserArchivist = (context: interfaces.Context) => {
  if (userArchivist) return userArchivist
  const sdk: BaseMongoSdk<User> = context.container.get<BaseMongoSdk<User>>(MONGO_TYPES.UserSdk)
  userArchivist = new MongoDBUserArchivist(sdk)
  return userArchivist
}

const getMongoDBDeterministicArchivist = async (context: interfaces.Context) => {
  if (archivist) return archivist
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(
    MONGO_TYPES.BoundWitnessSdk,
  )
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = context.container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const mongoDBDeterministicArchivist = await MongoDBDeterministicArchivist.create({
    boundWitnessSdk,
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
    payloadSdk,
  })
  archivist = mongoDBDeterministicArchivist
  return archivist
}

export const ArchivistContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBUserArchivist).toDynamicValue(getMongoDBUserArchivist).inSingletonScope()
  bind<UserArchivist>(TYPES.UserArchivist).toDynamicValue(getMongoDBUserArchivist).inSingletonScope()

  bind(MongoDBDeterministicArchivist).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
  bind<AbstractArchivist>(TYPES.Archivist).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
  bind<AbstractModule>(TYPES.Module).toDynamicValue(getMongoDBDeterministicArchivist).inSingletonScope()
})
