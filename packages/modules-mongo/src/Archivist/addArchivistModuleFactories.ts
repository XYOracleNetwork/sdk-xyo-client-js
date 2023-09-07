import { HDWallet } from '@xyo-network/account'
import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'

const getMongoDBArchivistFactory = async (container: Container, name = TYPES.Archivist.description) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const wallet = await HDWallet.fromMnemonic(mnemonic)
  const accountDerivationPath = WALLET_PATHS.Archivists.Archivist
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const payloadSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  return new ModuleFactory(MongoDBDeterministicArchivist, {
    boundWitnessSdkConfig,
    config: { accountDerivationPath, name, schema: MongoDBDeterministicArchivist.configSchema },
    payloadSdkConfig,
    wallet,
  })
}

export const addArchivistModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[ArchivistConfigSchema] = await getMongoDBArchivistFactory(container)
  dictionary[MongoDBDeterministicArchivist.configSchema] = await getMongoDBArchivistFactory(container)
}
