/* eslint-disable max-statements */
import {
  MongoDBAddressHistoryDiviner,
  MongoDBAddressHistoryDivinerParams,
  MongoDBAddressSpaceDiviner,
  MongoDBAddressSpaceDivinerParams,
  MongoDBBoundWitnessDiviner,
  MongoDBBoundWitnessDivinerParams,
  MongoDBPayloadDiviner,
  MongoDBPayloadDivinerParams,
} from '@xyo-network/diviner-mongodb'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk, BaseMongoSdkPrivateConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBaseMongoSdkPrivateConfig, getBoundWitnessSdk, getPayloadSdk } from '../Mongo'
import { MongoDBAddressSpaceBatchDiviner, MongoDBAddressSpaceBatchDivinerParams } from './AddressSpace'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerParams } from './BoundWitnessStats'
import { MongoDBPayloadStatsDiviner, MongoDBPayloadStatsDivinerParams } from './PayloadStats'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerParams } from './SchemaList'
import { MongoDBSchemaStatsDiviner, MongoDBSchemaStatsDivinerParams } from './SchemaStats'

const getMongoDBAddressHistoryDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressHistoryDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressHistoryDiviner.configSchema } }
  return ModuleFactory.withParams(MongoDBAddressHistoryDiviner, params)
}
const getMongoDBAddressSpaceDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressSpaceDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressSpaceDiviner.configSchema } }
  return ModuleFactory.withParams(MongoDBAddressSpaceDiviner, params)
}
const getMongoDBAddressSpaceBatchDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressSpaceBatchDivinerParams = { boundWitnessSdk, config: { schema: MongoDBAddressSpaceBatchDiviner.configSchema } }
  return ModuleFactory.withParams(MongoDBAddressSpaceBatchDiviner, params)
}
const getMongoDBBoundWitnessDiviner = () => {
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const params: MongoDBBoundWitnessDivinerParams = {
    boundWitnessSdk,
    boundWitnessSdkConfig,
    config: { schema: MongoDBBoundWitnessDiviner.configSchema },
  }
  return ModuleFactory.withParams(MongoDBBoundWitnessDiviner, params)
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
  return ModuleFactory.withParams(MongoDBBoundWitnessStatsDiviner, params)
}
const getMongoDBPayloadDiviner = () => {
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params: MongoDBPayloadDivinerParams = {
    config: {
      schema: MongoDBPayloadDiviner.configSchema,
    },
    payloadSdk,
  }
  return ModuleFactory.withParams(MongoDBPayloadDiviner, params)
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
  locator.register(getMongoDBAddressHistoryDiviner())
  locator.register(getMongoDBAddressSpaceDiviner())
  locator.register(getMongoDBAddressSpaceBatchDiviner())
  locator.register(getMongoDBBoundWitnessDiviner())
  locator.register(getMongoDBBoundWitnessStatsDiviner(container))
  locator.register(getMongoDBPayloadDiviner())
  locator.register(getMongoDBPayloadStatsDiviner(container))
  locator.register(getMongoDBSchemaListDiviner())
  locator.register(getMongoDBSchemaStatsDiviner(container))
}
