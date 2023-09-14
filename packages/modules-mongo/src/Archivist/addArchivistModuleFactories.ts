import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'

const getMongoDBArchivistFactory = () => {
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const payloadSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  return ModuleFactory.withParams(MongoDBDeterministicArchivist, {
    boundWitnessSdkConfig,
    config: { schema: MongoDBDeterministicArchivist.configSchema },
    payloadSdkConfig,
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(getMongoDBArchivistFactory(), MongoDBDeterministicArchivist.labels)
}
