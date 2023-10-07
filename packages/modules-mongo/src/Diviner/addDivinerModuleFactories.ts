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
} from '@xyo-network/diviner-mongodb'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { MongoDBModuleParams } from '@xyo-network/module-model-mongodb'
import { JobQueue } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

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
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const schema = MongoDBSchemaStatsDiviner.configSchema
  const params: MongoDBModuleParams = { config: { schema }, jobQueue }
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
