import { MongoDBArchivist } from '@xyo-network/archivist-mongodb'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig } from '../Mongo'

const getMongoDBArchivistFactory = () => {
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const payloadSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  return ModuleFactory.withParams(MongoDBArchivist, {
    boundWitnessSdkConfig,
    config: { schema: MongoDBArchivist.configSchema },
    payloadSdkConfig,
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(getMongoDBArchivistFactory(), MongoDBArchivist.labels)
}
