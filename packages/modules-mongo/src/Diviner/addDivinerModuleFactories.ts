/* eslint-disable max-statements */
import { CreatableModuleDictionary, ModuleFactory, ModuleFactoryLocator, toCreatableModuleRegistry } from '@xyo-network/module'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk, BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig, getBoundWitnessSdk, getPayloadSdk } from '../Mongo'
import { MongoDBAddressHistoryDiviner, MongoDBAddressHistoryDivinerParams } from './AddressHistory'
import {
  MongoDBAddressSpaceBatchDiviner,
  MongoDBAddressSpaceBatchDivinerParams,
  MongoDBAddressSpaceDiviner,
  MongoDBAddressSpaceDivinerParams,
} from './AddressSpace'
import { MongoDBBoundWitnessDiviner, MongoDBBoundWitnessDivinerParams } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerParams } from './BoundWitnessStats'
import { MongoDBPayloadDiviner, MongoDBPayloadDivinerParams } from './Payload'
import { MongoDBPayloadStatsDiviner, MongoDBPayloadStatsDivinerParams } from './PayloadStats'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerParams } from './SchemaList'
import { MongoDBSchemaStatsDiviner, MongoDBSchemaStatsDivinerParams } from './SchemaStats'

const getMongoDBAddressHistoryDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressHistoryDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressHistoryDiviner.configSchema } }
  return new ModuleFactory(MongoDBAddressHistoryDiviner, params)
}
const getMongoDBAddressSpaceDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressSpaceDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressSpaceDiviner.configSchema } }
  return new ModuleFactory(MongoDBAddressSpaceDiviner, params)
}
const getMongoDBAddressSpaceBatchDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressSpaceBatchDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressSpaceBatchDiviner.configSchema } }
  return new ModuleFactory(MongoDBAddressSpaceBatchDiviner, params)
}
const getMongoDBBoundWitnessDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const params: MongoDBBoundWitnessDivinerParams = {
    boundWitnessSdk,
    boundWitnessSdkConfig,
    config: { schema: MongoDBBoundWitnessDiviner.configSchema },
  }
  return new ModuleFactory(MongoDBBoundWitnessDiviner, params)
}
const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params: MongoDBBoundWitnessStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      schema: MongoDBBoundWitnessStatsDiviner.configSchema,
    },
    jobQueue,
  }
  return new ModuleFactory(MongoDBBoundWitnessStatsDiviner, params)
}
const getMongoDBPayloadDiviner = () => {
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params: MongoDBPayloadDivinerParams = {
    config: {
      schema: MongoDBPayloadDiviner.configSchema,
    },
    payloadSdk,
  }
  return new ModuleFactory(MongoDBPayloadDiviner, params)
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params: MongoDBPayloadStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      schema: MongoDBPayloadStatsDiviner.configSchema,
    },
    jobQueue,
    payloadSdk,
  }
  return new ModuleFactory(MongoDBPayloadStatsDiviner, params)
}
const getMongoDBSchemaListDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBSchemaListDivinerParams = {
    boundWitnessSdk,
    config: {
      schema: MongoDBSchemaListDiviner.configSchema,
    },
  }
  return new ModuleFactory(MongoDBSchemaListDiviner, params)
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
  return new ModuleFactory(MongoDBSchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MongoDBAddressHistoryDiviner.configSchema] = getMongoDBAddressHistoryDiviner()
  dictionary[MongoDBAddressSpaceDiviner.configSchema] = getMongoDBAddressSpaceDiviner()
  dictionary[MongoDBAddressSpaceBatchDiviner.configSchema] = getMongoDBAddressSpaceBatchDiviner()
  dictionary[MongoDBBoundWitnessDiviner.configSchema] = getMongoDBBoundWitnessDiviner()
  dictionary[MongoDBBoundWitnessStatsDiviner.configSchema] = getMongoDBBoundWitnessStatsDiviner(container)
  dictionary[MongoDBPayloadDiviner.configSchema] = getMongoDBPayloadDiviner()
  dictionary[MongoDBPayloadStatsDiviner.configSchema] = getMongoDBPayloadStatsDiviner(container)
  dictionary[MongoDBSchemaListDiviner.configSchema] = getMongoDBSchemaListDiviner()
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = getMongoDBSchemaStatsDiviner(container)

  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  const registry = toCreatableModuleRegistry(dictionary)
  locator.registerAdditional(registry)
}
