/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import {
  AddressHistoryDivinerConfig,
  AddressHistoryDivinerConfigSchema,
  AddressSpaceDivinerConfig,
  AddressSpaceDivinerConfigSchema,
  BoundWitnessDivinerConfig,
  BoundWitnessDivinerConfigSchema,
  BoundWitnessStatsDivinerConfig,
  BoundWitnessStatsDivinerConfigSchema,
  ForecastingDivinerConfig,
  ForecastingDivinerConfigSchema,
  ForecastingMethod,
  PayloadDivinerConfig,
  PayloadDivinerConfigSchema,
  PayloadStatsDivinerConfig,
  PayloadStatsDivinerConfigSchema,
  PayloadValueTransformer,
  SchemaListDivinerConfig,
  SchemaListDivinerConfigSchema,
  SchemaStatsDivinerConfig,
  SchemaStatsDivinerConfigSchema,
} from '@xyo-network/diviner-models'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta, ConfigModuleFactory, ConfigModuleFactoryDictionary, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
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
  const factory = (config: AnyConfigSchema<AddressHistoryDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.AddressHistory,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressHistoryDiviner.description },
      wallet,
    }
    return MongoDBAddressHistoryDiviner.create(params)
  }
  return factory
}
const getMongoDBAddressSpaceDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<AddressSpaceDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.AddressSpace,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressSpaceDiviner.description },
      wallet,
    }
    return MongoDBAddressSpaceDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<BoundWitnessDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.BoundWitness,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessDiviner.description },
      wallet,
    }
    return MongoDBBoundWitnessDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const factory = (config: AnyConfigSchema<BoundWitnessStatsDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.BoundWitnessStats,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessStatsDiviner.description },
      jobQueue,
      wallet,
    }
    return MongoDBBoundWitnessStatsDiviner.create(params)
  }
  return factory
}
const getMemoryForecastingDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  // TODO: Make string injection in config instead of params
  let forecastingMethod: ForecastingMethod
  let transformer: PayloadValueTransformer
  const factory: ConfigModuleFactory = (config: AnyConfigSchema<ForecastingDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
      boundWitnessSdk,
      config: { ...config, name: TYPES.ForecastingDiviner.description },
      forecastingMethod,
      jobQueue,
      payloadSdk,
      transformer,
      wallet,
    }
    return MemoryForecastingDiviner.create(params)
  }
  return factory
}
const getMongoDBPayloadDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = (config: AnyConfigSchema<PayloadDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.Payload,
      config: { ...config, name: TYPES.PayloadDiviner.description },
      payloadSdk,
      wallet,
    }
    return MongoDBPayloadDiviner.create(params)
  }
  return factory
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = (config: AnyConfigSchema<PayloadStatsDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
      boundWitnessSdk,
      config: { ...config, name: TYPES.PayloadStatsDiviner.description },
      jobQueue,
      payloadSdk,
      wallet,
    }
    return MongoDBPayloadStatsDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaListDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<SchemaListDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaListDiviner.description },
      wallet,
    }
    return MongoDBSchemaListDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaStatsDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const factory = (config: AnyConfigSchema<SchemaStatsDivinerConfig>) => {
    const params = {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
      jobQueue,
      wallet,
    }
    return MongoDBSchemaStatsDiviner.create(params)
  }
  return factory
}

export const addDivinerConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
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
