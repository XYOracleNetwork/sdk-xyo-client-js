/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
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

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

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
const getMongoDBAddressSpaceBatchDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBAddressSpaceBatchDivinerParams = {
    boundWitnessSdk,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.AddressSpaceBatch,
      archivist: 'Archivist',
      name: TYPES.AddressSpaceBatchDiviner.description,
      schema: MongoDBAddressSpaceBatchDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MongoDBAddressSpaceBatchDiviner, params)
}
const getMongoDBBoundWitnessDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const boundWitnessSdkConfig: BaseMongoSdkPrivateConfig = getBaseMongoSdkPrivateConfig()
  const params: MongoDBBoundWitnessDivinerParams = {
    boundWitnessSdk,
    boundWitnessSdkConfig,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.BoundWitness,
      name: TYPES.BoundWitnessDiviner.description,
      schema: MongoDBBoundWitnessDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MongoDBBoundWitnessDiviner, params)
}
const getMongoDBBoundWitnessStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params: MongoDBBoundWitnessStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.BoundWitnessStats,
      name: TYPES.BoundWitnessStatsDiviner.description,
      schema: MongoDBBoundWitnessStatsDiviner.configSchema,
    },
    jobQueue,
    wallet,
  }
  return new ModuleFactory(MongoDBBoundWitnessStatsDiviner, params)
}
const getMongoDBPayloadDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params: MongoDBPayloadDivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.Payload,
      name: TYPES.PayloadDiviner.description,
      schema: MongoDBPayloadDiviner.configSchema,
    },
    payloadSdk,
    wallet,
  }
  return new ModuleFactory(MongoDBPayloadDiviner, params)
}
const getMongoDBPayloadStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params: MongoDBPayloadStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
      name: TYPES.PayloadStatsDiviner.description,
      schema: MongoDBPayloadStatsDiviner.configSchema,
    },
    jobQueue,
    payloadSdk,
    wallet,
  }
  return new ModuleFactory(MongoDBPayloadStatsDiviner, params)
}
const getMongoDBSchemaListDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params: MongoDBSchemaListDivinerParams = {
    boundWitnessSdk,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
      name: TYPES.SchemaListDiviner.description,
      schema: MongoDBSchemaListDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MongoDBSchemaListDiviner, params)
}
const getMongoDBSchemaStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params: MongoDBSchemaStatsDivinerParams = {
    boundWitnessSdk,
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
      name: TYPES.SchemaStatsDiviner.description,
      schema: MongoDBSchemaStatsDiviner.configSchema,
    },
    jobQueue,
    wallet,
  }
  return new ModuleFactory(MongoDBSchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MongoDBAddressHistoryDiviner.configSchema] = getMongoDBAddressHistoryDiviner()
  dictionary[MongoDBAddressSpaceDiviner.configSchema] = getMongoDBAddressSpaceDiviner()
  dictionary[MongoDBAddressSpaceBatchDiviner.configSchema] = await getMongoDBAddressSpaceBatchDiviner(container)
  dictionary[MongoDBBoundWitnessDiviner.configSchema] = await getMongoDBBoundWitnessDiviner(container)
  dictionary[MongoDBBoundWitnessStatsDiviner.configSchema] = await getMongoDBBoundWitnessStatsDiviner(container)
  dictionary[MongoDBPayloadDiviner.configSchema] = await getMongoDBPayloadDiviner(container)
  dictionary[MongoDBPayloadStatsDiviner.configSchema] = await getMongoDBPayloadStatsDiviner(container)
  dictionary[MongoDBSchemaListDiviner.configSchema] = await getMongoDBSchemaListDiviner(container)
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = await getMongoDBSchemaStatsDiviner(container)
}
