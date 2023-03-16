import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveModuleConfigSchema, User, UserArchivist, XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { getBaseMongoSdk } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

let userArchivist: MongoDBUserArchivist
let archivist: MongoDBDeterministicArchivist

const getMongoDBUserArchivist = (_context: interfaces.Context) => {
  if (userArchivist) return userArchivist
  const sdk = getBaseMongoSdk<User>(COLLECTIONS.Users)
  userArchivist = new MongoDBUserArchivist(sdk)
  return userArchivist
}

const getMongoDBDeterministicArchivist = async (_context: interfaces.Context) => {
  if (archivist) return archivist
  const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const payloads: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const mongoDBDeterministicArchivist = await MongoDBDeterministicArchivist.create({
    boundWitnesses,
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
    payloads,
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
