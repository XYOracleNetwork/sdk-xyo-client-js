import { Account } from '@xyo-network/account'
import { AbstractArchivist, ArchivistConfig } from '@xyo-network/archivist'
import { AnyConfigSchema } from '@xyo-network/module'
import { BoundWitnessWithMeta, ConfigModuleFactory, ConfigModuleFactoryDictionary, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBDeterministicArchivist } from './Deterministic'

const getMongoDBArchivistFactory = (container: Container): ConfigModuleFactory<AbstractArchivist> => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Archivists.Archivist)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const archivistFactory = async (config: AnyConfigSchema<ArchivistConfig>) =>
    await MongoDBDeterministicArchivist.create({
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.Archivist.description, schema: MongoDBDeterministicArchivist.configSchema },
      payloadSdk,
    })
  return archivistFactory
}

export const addArchivistConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBDeterministicArchivist.configSchema] = getMongoDBArchivistFactory(container)
}
