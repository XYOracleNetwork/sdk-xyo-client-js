import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AbstractArchivist } from '@xyo-network/archivist'
import { AbstractModule } from '@xyo-network/module'
import { ArchiveModuleConfigSchema, BoundWitnessWithMeta, PayloadWithMeta, User, UserArchivist } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBDeterministicArchivist } from './Deterministic'
import { MongoDBUserArchivist } from './User'

let userArchivist: MongoDBUserArchivist
let archivist: MongoDBDeterministicArchivist

const getAccount = (path: string): AccountInstance => {
  const mnemonic = assertEx(process.env.MNEMONIC, 'Missing mnemonic for wallet creation')
  return Account.fromMnemonic(mnemonic, path)
}

const getMongoDBUserArchivist = (context: interfaces.Context) => {
  if (userArchivist) return userArchivist
  const sdk: BaseMongoSdk<User> = context.container.get<BaseMongoSdk<User>>(MONGO_TYPES.UserSdk)
  userArchivist = new MongoDBUserArchivist(sdk)
  return userArchivist
}

const getMongoDBArchivist = async (context: interfaces.Context) => {
  if (archivist) return archivist
  const account = getAccount(WALLET_PATHS.Archivist.Archivist)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = context.container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  archivist = await MongoDBDeterministicArchivist.create({
    account,
    boundWitnessSdk,
    config: { name: TYPES.Archivist.description, schema: ArchiveModuleConfigSchema },
    payloadSdk,
  })
  return archivist
}

export const ArchivistContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBUserArchivist).toDynamicValue(getMongoDBUserArchivist).inSingletonScope()
  bind<UserArchivist>(TYPES.UserArchivist).toDynamicValue(getMongoDBUserArchivist).inSingletonScope()

  bind(MongoDBDeterministicArchivist).toDynamicValue(getMongoDBArchivist).inSingletonScope()
  bind<AbstractArchivist>(TYPES.Archivist).toDynamicValue(getMongoDBArchivist).inSingletonScope()
  bind<AbstractModule>(TYPES.Module).toDynamicValue(getMongoDBArchivist).inSingletonScope()
})
