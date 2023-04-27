/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import {
  AddressSpaceDivinerConfig,
  AddressSpaceDivinerConfigSchema,
  BoundWitnessStatsDivinerConfig,
  BoundWitnessStatsDivinerConfigSchema,
  PayloadStatsDivinerConfig,
  PayloadStatsDivinerConfigSchema,
  SchemaListDivinerConfig,
  SchemaListDivinerConfigSchema,
  SchemaStatsDivinerConfig,
  SchemaStatsDivinerConfigSchema,
} from '@xyo-network/diviner'
import { AddressHistoryDivinerConfig, AddressHistoryDivinerConfigSchema } from '@xyo-network/diviner-address-history'
import { BoundWitnessDivinerConfig, BoundWitnessDivinerConfigSchema } from '@xyo-network/diviner-boundwitness-model'
import {
  ForecastingDivinerConfig,
  ForecastingDivinerConfigSchema,
  ForecastingMethod,
  MemoryForecastingDiviner,
  PayloadValueTransformer,
} from '@xyo-network/diviner-forecasting'
import { PayloadDivinerConfig, PayloadDivinerConfigSchema } from '@xyo-network/diviner-payload-model'
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

const getMongoDBAddressHistoryDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressHistory)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<AddressHistoryDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressHistoryDiviner.description },
    }
    return MongoDBAddressHistoryDiviner.create(params)
  }
  return factory
}
const getMongoDBAddressSpaceDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressSpace)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<AddressSpaceDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressSpaceDiviner.description },
    }
    return MongoDBAddressSpaceDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitness)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<BoundWitnessDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessDiviner.description },
    }
    return MongoDBBoundWitnessDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitnessStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const factory = (config: AnyConfigSchema<BoundWitnessStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessStatsDiviner.description },
      jobQueue,
    }
    return MongoDBBoundWitnessStatsDiviner.create(params)
  }
  return factory
}
const getMemoryForecastingDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.Forecasting)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  // TODO: Make string injection in config instead of params
  let forecastingMethod: ForecastingMethod
  let transformer: PayloadValueTransformer
  const factory: ConfigModuleFactory = (config: AnyConfigSchema<ForecastingDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.ForecastingDiviner.description },
      forecastingMethod,
      jobQueue,
      payloadSdk,
      transformer,
    }
    return MemoryForecastingDiviner.create(params)
  }
  return factory
}
const getMongoDBPayloadDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.Payload)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = (config: AnyConfigSchema<PayloadDivinerConfig>) => {
    const params = {
      account,
      config: { ...config, name: TYPES.PayloadDiviner.description },
      payloadSdk,
    }
    return MongoDBPayloadDiviner.create(params)
  }
  return factory
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.PayloadStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = (config: AnyConfigSchema<PayloadStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.PayloadStatsDiviner.description },
      jobQueue,
      payloadSdk,
    }
    return MongoDBPayloadStatsDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaListDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaList)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<SchemaListDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaListDiviner.description },
    }
    return MongoDBSchemaListDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  const factory = (config: AnyConfigSchema<SchemaStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
      jobQueue,
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
