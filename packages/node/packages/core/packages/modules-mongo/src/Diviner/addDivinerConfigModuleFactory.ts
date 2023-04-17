/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import { BoundWitnessWithMeta, ConfigModuleFactoryDictionary, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBPayloadStatsDiviner } from './PayloadStats'
import { MongoDBSchemaListDiviner } from './SchemaList'
import { MongoDBSchemaStatsDiviner } from './SchemaStats'

let mongoDBAddressHistoryDiviner: MongoDBAddressHistoryDiviner
let mongoDBAddressSpaceDiviner: MongoDBAddressSpaceDiviner
let mongoDBBoundWitnessDiviner: MongoDBBoundWitnessDiviner
let mongoDBBoundWitnessStatsDiviner: MongoDBBoundWitnessStatsDiviner
let mongoDBLocationCertaintyDiviner: MongoDBLocationCertaintyDiviner
let mongoDBPayloadDiviner: MongoDBPayloadDiviner
let mongoDBPayloadStatsDiviner: MongoDBPayloadStatsDiviner
let mongoDBSchemaListDiviner: MongoDBSchemaListDiviner
let mongoDBSchemaStatsDiviner: MongoDBSchemaStatsDiviner

const getMongoDBAddressHistoryDiviner = async (container: Container) => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressHistory)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.AddressHistoryDiviner.description, schema: MongoDBAddressHistoryDiviner.configSchema },
  }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBAddressSpaceDiviner = async (container: Container) => {
  if (mongoDBAddressSpaceDiviner) return mongoDBAddressSpaceDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressSpace)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.AddressSpaceDiviner.description, schema: MongoDBAddressSpaceDiviner.configSchema },
  }
  mongoDBAddressSpaceDiviner = await MongoDBAddressSpaceDiviner.create(params)
  return mongoDBAddressSpaceDiviner
}
const getMongoDBBoundWitnessDiviner = async (container: Container) => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitness)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessDiviner.description, schema: MongoDBBoundWitnessDiviner.configSchema },
  }
  mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create(params)
  return mongoDBBoundWitnessDiviner
}
const getMongoDBBoundWitnessStatsDiviner = async (container: Container) => {
  if (mongoDBBoundWitnessStatsDiviner) return mongoDBBoundWitnessStatsDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitnessStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBBoundWitnessStatsDiviner.configSchema },
  }
  mongoDBBoundWitnessStatsDiviner = await MongoDBBoundWitnessStatsDiviner.create(params)
  return mongoDBBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async (container: Container) => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.LocationCertainty)
  mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    account,
    config: { schema: MongoDBLocationCertaintyDiviner.configSchema },
  })) as MongoDBLocationCertaintyDiviner
  return mongoDBLocationCertaintyDiviner
}
const getMongoDBPayloadDiviner = async (container: Container) => {
  if (mongoDBPayloadDiviner) return mongoDBPayloadDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.Payload)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = {
    account,
    config: { name: TYPES.PayloadDiviner.description, schema: MongoDBPayloadDiviner.configSchema },
    payloadSdk,
  }
  mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create(params)
  return mongoDBPayloadDiviner
}
const getMongoDBPayloadStatsDiviner = async (container: Container) => {
  if (mongoDBPayloadStatsDiviner) return mongoDBPayloadStatsDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.PayloadStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.PayloadStatsDiviner.description, schema: MongoDBPayloadStatsDiviner.configSchema },
    payloadSdk,
  }
  mongoDBPayloadStatsDiviner = await MongoDBPayloadStatsDiviner.create(params)
  return mongoDBPayloadStatsDiviner
}
const getMongoDBSchemaListDiviner = async (container: Container) => {
  if (mongoDBSchemaListDiviner) return mongoDBSchemaListDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaList)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.SchemaListDiviner.description, schema: MongoDBSchemaListDiviner.configSchema },
  }
  mongoDBSchemaListDiviner = await MongoDBSchemaListDiviner.create(params)
  return mongoDBSchemaListDiviner
}
const getMongoDBSchemaStatsDiviner = async (container: Container) => {
  if (mongoDBSchemaStatsDiviner) return mongoDBSchemaStatsDiviner
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(container)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
  }
  mongoDBSchemaStatsDiviner = await MongoDBSchemaStatsDiviner.create(params)
  return mongoDBSchemaStatsDiviner
}

export const addDivinerConfigModuleFactory = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBAddressHistoryDiviner.configSchema] = getMongoDBAddressHistoryDiviner(container)
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = getMongoDBAddressSpaceDiviner(container)
  dictionary[MongoDBBoundWitnessDiviner.configSchema] = getMongoDBBoundWitnessDiviner(container)
  dictionary[MongoDBBoundWitnessStatsDiviner.configSchema] = getMongoDBBoundWitnessStatsDiviner(container)
  dictionary[MongoDBLocationCertaintyDiviner.configSchema] = getMongoDBLocationCertaintyDiviner(container)
  dictionary[MongoDBPayloadDiviner.configSchema] = getMongoDBPayloadDiviner(container)
  dictionary[MongoDBPayloadStatsDiviner.configSchema] = getMongoDBPayloadStatsDiviner(container)
  dictionary[MongoDBSchemaListDiviner.configSchema] = getMongoDBSchemaListDiviner(container)
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = getMongoDBSchemaStatsDiviner(container)

  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
}
