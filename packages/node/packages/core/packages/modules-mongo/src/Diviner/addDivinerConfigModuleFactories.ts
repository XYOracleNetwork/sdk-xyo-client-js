/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import {
  AddressHistoryDivinerConfigSchema,
  AddressSpaceDivinerConfigSchema,
  BoundWitnessDivinerConfigSchema,
  BoundWitnessStatsDivinerConfigSchema,
  ForecastingDivinerConfigSchema,
  PayloadDivinerConfigSchema,
  PayloadStatsDivinerConfigSchema,
  SchemaListDivinerConfigSchema,
  SchemaStatsDivinerConfigSchema,
} from '@xyo-network/diviner-models'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBoundWitnessSdk, getPayloadSdk } from '../Mongo'
import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner } from './BoundWitnessStats'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBPayloadStatsDiviner } from './PayloadStats'
import { MongoDBSchemaListDiviner } from './SchemaList'
import { MongoDBSchemaStatsDiviner } from './SchemaStats'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const getMongoDBAddressHistoryDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressHistory,
    boundWitnessSdk,
    config: { name: TYPES.AddressHistoryDiviner.description, schema: MongoDBAddressHistoryDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MongoDBAddressHistoryDiviner, params)
}
const getMongoDBAddressSpaceDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressSpace,
    boundWitnessSdk,
    config: { name: TYPES.AddressSpaceDiviner.description, schema: MongoDBAddressSpaceDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MongoDBAddressSpaceDiviner, params)
}
const getMongoDBBoundWitnessDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.BoundWitness,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessDiviner.description, schema: MongoDBBoundWitnessDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MongoDBBoundWitnessDiviner, params)
}
const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.BoundWitnessStats,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBBoundWitnessStatsDiviner.configSchema },
    jobQueue,
    wallet,
  }
  return new ModuleFactory(MongoDBBoundWitnessStatsDiviner, params)
}
const getMemoryForecastingDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const forecastingMethod = 'arimaForecasting'
  const jsonPathExpression = '$.feePerGas.medium'
  const witnessSchema = 'network.xyo.blockchain.ethereum.gas'
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
    boundWitnessSdk,
    config: {
      forecastingMethod,
      jsonPathExpression,
      name: TYPES.ForecastingDiviner.description,
      schema: MemoryForecastingDiviner.configSchema,
      witnessSchema,
    },
    forecastingMethod,
    jobQueue,
    payloadSdk,
    wallet,
  }
  return new ModuleFactory(MemoryForecastingDiviner, params)
}
const getMongoDBPayloadDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.Payload,
    config: { name: TYPES.PayloadDiviner.description, schema: MongoDBPayloadDiviner.configSchema },
    payloadSdk,
    wallet,
  }
  return new ModuleFactory(MongoDBPayloadDiviner, params)
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
    boundWitnessSdk,
    config: { name: TYPES.PayloadStatsDiviner.description, schema: MongoDBPayloadStatsDiviner.configSchema },
    jobQueue,
    payloadSdk,
    wallet,
  }
  return new ModuleFactory(MongoDBPayloadStatsDiviner, params)
}
const getMongoDBSchemaListDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
    boundWitnessSdk,
    config: { name: TYPES.SchemaListDiviner.description, schema: MongoDBSchemaListDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MongoDBSchemaListDiviner, params)
}
const getMongoDBSchemaStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
    boundWitnessSdk,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
    jobQueue,
    wallet,
  }
  return new ModuleFactory(MongoDBSchemaStatsDiviner, params)
}

export const addDivinerConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[AddressHistoryDivinerConfigSchema] = getMongoDBAddressHistoryDiviner(container)
  dictionary[AddressSpaceDivinerConfigSchema] = getMongoDBAddressSpaceDiviner(container)
  dictionary[BoundWitnessDivinerConfigSchema] = getMongoDBBoundWitnessDiviner(container)
  dictionary[BoundWitnessStatsDivinerConfigSchema] = getMongoDBBoundWitnessStatsDiviner(container)
  dictionary[ForecastingDivinerConfigSchema] = getMemoryForecastingDiviner(container)
  dictionary[PayloadDivinerConfigSchema] = getMongoDBPayloadDiviner(container)
  dictionary[PayloadStatsDivinerConfigSchema] = getMongoDBPayloadStatsDiviner(container)
  dictionary[SchemaListDivinerConfigSchema] = getMongoDBSchemaListDiviner(container)
  dictionary[SchemaStatsDivinerConfigSchema] = getMongoDBSchemaStatsDiviner(container)
}
