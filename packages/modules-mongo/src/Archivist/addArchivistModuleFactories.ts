import { ArchivistConfigSchema } from '@xyo-network/archivist-model'
import { CreatableModuleDictionary, ModuleFactory, ModuleFactoryLocator, toCreatableModuleRegistry } from '@xyo-network/module'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'

const getMongoDBArchivistFactory = () => {
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const payloadSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  return new ModuleFactory(MongoDBDeterministicArchivist, {
    boundWitnessSdkConfig,
    config: { schema: MongoDBDeterministicArchivist.configSchema },
    payloadSdkConfig,
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[ArchivistConfigSchema] = getMongoDBArchivistFactory()
  dictionary[MongoDBDeterministicArchivist.configSchema] = getMongoDBArchivistFactory()

  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  const registry = toCreatableModuleRegistry(dictionary)
  locator.registerAdditional(registry)
}
