import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveModuleConfigSchema, User, UserArchivist, XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { AsyncContainerModule, interfaces } from 'inversify'

import { COLLECTIONS } from '../collections'
import { getBaseMongoSdk } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

const getMongoDBUserArchivist = () => {
  const sdk = getBaseMongoSdk<User>(COLLECTIONS.Users)
  return new MongoDBUserArchivist(sdk)
}

const getMongoDBDeterministicArchivist = async () => {
  const boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const payloads: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const mongoDBDeterministicArchivist = await MongoDBDeterministicArchivist.create({
    boundWitnesses,
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
    payloads,
  })
  return mongoDBDeterministicArchivist
}

export const ArchivistContainerModule = new AsyncContainerModule(async (bind: interfaces.Bind) => {
  const userArchivist = getMongoDBUserArchivist()
  bind(MongoDBUserArchivist).toConstantValue(userArchivist)
  bind<UserArchivist>(TYPES.UserArchivist).toService(MongoDBUserArchivist)

  const archivist = await getMongoDBDeterministicArchivist()
  bind(MongoDBDeterministicArchivist).toConstantValue(archivist)
  bind<AbstractArchivist>(TYPES.Archivist).toService(MongoDBDeterministicArchivist)
  bind<AbstractModule>(TYPES.Module).toService(MongoDBDeterministicArchivist)
})
