/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import { AddressHistoryDiviner, AddressSpaceDiviner } from '@xyo-network/diviner'
import { Module } from '@xyo-network/module-model'
import {
  BoundWitnessDiviner,
  BoundWitnessStatsDiviner,
  BoundWitnessWithMeta,
  LocationCertaintyDiviner,
  PayloadDiviner,
  PayloadStatsDiviner,
  PayloadWithMeta,
  SchemaListDiviner,
  SchemaStatsDiviner,
} from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { JobProvider } from '@xyo-network/shared'
import { ContainerModule, interfaces } from 'inversify'

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

const getMongoDBAddressHistoryDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressHistory)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.AddressHistoryDiviner.description, schema: MongoDBAddressHistoryDiviner.configSchema },
  }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBAddressSpaceDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressSpaceDiviner) return mongoDBAddressSpaceDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressSpace)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.AddressSpaceDiviner.description, schema: MongoDBAddressSpaceDiviner.configSchema },
  }
  mongoDBAddressSpaceDiviner = await MongoDBAddressSpaceDiviner.create(params)
  return mongoDBAddressSpaceDiviner
}
const getMongoDBBoundWitnessDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitness)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessDiviner.description, schema: MongoDBBoundWitnessDiviner.configSchema },
  }
  mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create(params)
  return mongoDBBoundWitnessDiviner
}
const getMongoDBBoundWitnessStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessStatsDiviner) return mongoDBBoundWitnessStatsDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitnessStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBBoundWitnessStatsDiviner.configSchema },
  }
  mongoDBBoundWitnessStatsDiviner = await MongoDBBoundWitnessStatsDiviner.create(params)
  return mongoDBBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async (context: interfaces.Context) => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.LocationCertainty)
  mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    account,
    config: { schema: MongoDBLocationCertaintyDiviner.configSchema },
  })) as MongoDBLocationCertaintyDiviner
  return mongoDBLocationCertaintyDiviner
}
const getMongoDBPayloadDiviner = async (context: interfaces.Context) => {
  if (mongoDBPayloadDiviner) return mongoDBPayloadDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.Payload)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = context.container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = {
    account,
    config: { name: TYPES.PayloadDiviner.description, schema: MongoDBPayloadDiviner.configSchema },
    payloadSdk,
  }
  mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create(params)
  return mongoDBPayloadDiviner
}
const getMongoDBPayloadStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBPayloadStatsDiviner) return mongoDBPayloadStatsDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.PayloadStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = context.container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
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
const getMongoDBSchemaListDiviner = async (context: interfaces.Context) => {
  if (mongoDBSchemaListDiviner) return mongoDBSchemaListDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaList)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.SchemaListDiviner.description, schema: MongoDBSchemaListDiviner.configSchema },
  }
  mongoDBSchemaListDiviner = await MongoDBSchemaListDiviner.create(params)
  return mongoDBSchemaListDiviner
}
const getMongoDBSchemaStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBSchemaStatsDiviner) return mongoDBSchemaStatsDiviner
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaStats)
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const params = {
    account,
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
  }
  mongoDBSchemaStatsDiviner = await MongoDBSchemaStatsDiviner.create(params)
  return mongoDBSchemaStatsDiviner
}

export const addDivinerConfigModuleFactory = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBAddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()

  bind(MongoDBAddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<AddressSpaceDiviner>(TYPES.AddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()

  bind(MongoDBBoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()

  bind(MongoDBBoundWitnessStatsDiviner).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()

  bind(MongoDBLocationCertaintyDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()

  bind(MongoDBPayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<PayloadDiviner>(TYPES.PayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()

  bind(MongoDBPayloadStatsDiviner).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()

  bind(MongoDBSchemaListDiviner).toDynamicValue(getMongoDBSchemaListDiviner).inSingletonScope()
  bind<SchemaListDiviner>(TYPES.SchemaListDiviner).toDynamicValue(getMongoDBSchemaListDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBSchemaListDiviner).inSingletonScope()

  bind(MongoDBSchemaStatsDiviner).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
})
