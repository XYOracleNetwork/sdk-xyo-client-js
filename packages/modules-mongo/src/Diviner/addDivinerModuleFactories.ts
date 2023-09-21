import {
  MongoDBAddressHistoryDiviner,
  MongoDBAddressSpaceBatchDiviner,
  MongoDBAddressSpaceDiviner,
  MongoDBBoundWitnessDiviner,
  MongoDBBoundWitnessStatsDiviner,
  MongoDBBoundWitnessStatsDivinerParams,
  MongoDBPayloadDiviner,
  MongoDBPayloadDivinerParams,
  MongoDBPayloadStatsDiviner,
  MongoDBPayloadStatsDivinerParams,
  MongoDBSchemaListDiviner,
  MongoDBSchemaListDivinerParams,
  MongoDBSchemaStatsDiviner,
  MongoDBSchemaStatsDivinerParams,
} from '@xyo-network/diviner-mongodb'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module'
import { MongoDBModuleParams } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
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
const getMongoDBSchemaListDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBSchemaListDivinerParams = {
    boundWitnessSdk,
    config: {
      schema: MongoDBSchemaListDiviner.configSchema,
    },
  }
  return ModuleFactory.withParams(MongoDBSchemaListDiviner, params)
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
  locator.register(getMongoDBSchemaListDiviner())
  locator.register(getMongoDBSchemaStatsDiviner(container))
}
