import {
  MongoDBAddressHistoryDiviner,
  MongoDBAddressSpaceBatchDiviner,
  MongoDBAddressSpaceDiviner,
  MongoDBBoundWitnessDiviner,
  MongoDBBoundWitnessStatsDiviner,
  MongoDBPayloadDiviner,
  MongoDBPayloadStatsDiviner,
  MongoDBSchemaListDiviner,
  MongoDBSchemaStatsDiviner,
  MongoDBSchemaStatsDivinerParams,
} from '@xyo-network/diviner-mongodb'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module'
import { MongoDBModuleParams } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, JobQueue } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBoundWitnessSdk } from '../Mongo'

const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const schema = MongoDBBoundWitnessStatsDiviner.configSchema
  const params: MongoDBModuleParams = { config: { schema }, jobQueue }
  return ModuleFactory.withParams(MongoDBBoundWitnessStatsDiviner, params)
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const schema = MongoDBPayloadStatsDiviner.configSchema
  const params: MongoDBModuleParams = { config: { schema }, jobQueue }
  return ModuleFactory.withParams(MongoDBPayloadStatsDiviner, params)
}
const getMongoDBSchemaStatsDiviner = (container: Container) => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params: MongoDBSchemaStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      schema: MongoDBSchemaStatsDiviner.configSchema,
    },
    jobQueue,
  }
  return ModuleFactory.withParams(MongoDBSchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(MongoDBAddressHistoryDiviner)
  locator.register(MongoDBAddressSpaceDiviner)
  locator.register(MongoDBAddressSpaceBatchDiviner)
  locator.register(MongoDBBoundWitnessDiviner)
  locator.register(getMongoDBBoundWitnessStatsDiviner(container))
  locator.register(MongoDBPayloadDiviner)
  locator.register(getMongoDBPayloadStatsDiviner(container))
  locator.register(MongoDBSchemaListDiviner)
  locator.register(getMongoDBSchemaStatsDiviner(container))
}
