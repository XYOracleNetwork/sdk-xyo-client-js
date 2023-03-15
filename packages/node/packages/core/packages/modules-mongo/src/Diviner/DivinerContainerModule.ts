/* eslint-disable max-statements */
import { AddressHistoryDiviner, AddressSpaceDiviner, XyoArchivistPayloadDivinerConfigSchema, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { Module } from '@xyo-network/module-model'
import {
  BoundWitnessDiviner,
  BoundWitnessStatsDiviner,
  LocationCertaintyDiviner,
  ModuleAddressDiviner,
  PayloadDiviner,
  PayloadStatsDiviner,
  SchemaStatsDiviner,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { JobProvider } from '@xyo-network/shared'
import { ContainerModule, interfaces } from 'inversify'

import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBAddressBoundWitnessStatsDiviner, MongoDBAddressBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBAddressPayloadStatsDiviner, MongoDBAddressPayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner, MongoDBArchiveSchemaStatsDivinerConfigSchema } from './SchemaStats'

let mongoDBAddressHistoryDiviner: MongoDBAddressHistoryDiviner
let mongoDBAddressSpaceDiviner: MongoDBAddressSpaceDiviner
let mongoDBBoundWitnessDiviner: MongoDBBoundWitnessDiviner
let mongoDBArchiveBoundWitnessStatsDiviner: MongoDBAddressBoundWitnessStatsDiviner
let mongoDBLocationCertaintyDiviner: MongoDBLocationCertaintyDiviner
let mongoDBModuleAddressDiviner: MongoDBModuleAddressDiviner
let mongoDBPayloadDiviner: MongoDBPayloadDiviner
let mongoDBAddressPayloadStatsDiviner: MongoDBAddressPayloadStatsDiviner
let mongoDBArchiveSchemaStatsDiviner: MongoDBArchiveSchemaStatsDiviner

const getMongoDBAddressHistoryDiviner = async () => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const params = { config: { name: TYPES.AddressHistoryDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBAddressSpaceDiviner = async () => {
  if (mongoDBAddressSpaceDiviner) return mongoDBAddressSpaceDiviner
  const params = { config: { name: TYPES.AddressSpaceDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBAddressSpaceDiviner = await MongoDBAddressSpaceDiviner.create(params)
  return mongoDBAddressSpaceDiviner
}
const getMongoDBBoundWitnessDiviner = async () => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const params = { config: { name: TYPES.BoundWitnessDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create(params)
  return mongoDBBoundWitnessDiviner
}
const getMongoDBAddressBoundWitnessStatsDiviner = async (_context: interfaces.Context) => {
  if (mongoDBArchiveBoundWitnessStatsDiviner) return mongoDBArchiveBoundWitnessStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner()
  const params = {
    addressSpaceDiviner,
    config: { name: TYPES.ArchiveBoundWitnessStatsDiviner.description, schema: MongoDBAddressBoundWitnessStatsDivinerConfigSchema },
  }
  mongoDBArchiveBoundWitnessStatsDiviner = await MongoDBAddressBoundWitnessStatsDiviner.create(params)
  return mongoDBArchiveBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async () => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    config: { schema: XyoDivinerConfigSchema },
  })) as MongoDBLocationCertaintyDiviner
  return mongoDBLocationCertaintyDiviner
}
const getMongoDBModuleAddressDiviner = async () => {
  if (mongoDBModuleAddressDiviner) return mongoDBModuleAddressDiviner
  const params = { config: { name: TYPES.ModuleAddressDiviner.description, schema: XyoDivinerConfigSchema } }
  mongoDBModuleAddressDiviner = await MongoDBModuleAddressDiviner.create(params)
  return mongoDBModuleAddressDiviner
}
const getMongoDBPayloadDiviner = async () => {
  if (mongoDBPayloadDiviner) return mongoDBPayloadDiviner
  const params = { config: { name: TYPES.PayloadDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create(params)
  return mongoDBPayloadDiviner
}
const getMongoDBAddressPayloadStatsDiviner = async (_context: interfaces.Context) => {
  if (mongoDBAddressPayloadStatsDiviner) return mongoDBAddressPayloadStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner()
  const params = {
    addressSpaceDiviner,
    config: { name: TYPES.ArchivePayloadStatsDiviner.description, schema: MongoDBAddressPayloadStatsDivinerConfigSchema },
  }
  mongoDBAddressPayloadStatsDiviner = await MongoDBAddressPayloadStatsDiviner.create(params)
  return mongoDBAddressPayloadStatsDiviner
}
const getMongoDBArchiveSchemaStatsDiviner = async (_context: interfaces.Context) => {
  if (mongoDBArchiveSchemaStatsDiviner) return mongoDBArchiveSchemaStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner()
  const params = {
    addressSpaceDiviner,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBArchiveSchemaStatsDivinerConfigSchema },
  }
  mongoDBArchiveSchemaStatsDiviner = await MongoDBArchiveSchemaStatsDiviner.create(params)
  return mongoDBArchiveSchemaStatsDiviner
}

export const DivinerContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBAddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()

  bind(MongoDBAddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<AddressSpaceDiviner>(TYPES.AddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()

  bind(MongoDBBoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()

  bind(MongoDBAddressBoundWitnessStatsDiviner).toDynamicValue(getMongoDBAddressBoundWitnessStatsDiviner).inSingletonScope()
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toDynamicValue(getMongoDBAddressBoundWitnessStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBAddressBoundWitnessStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressBoundWitnessStatsDiviner).inSingletonScope()

  bind(MongoDBLocationCertaintyDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()

  bind(MongoDBModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner).inSingletonScope()
  bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBModuleAddressDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBModuleAddressDiviner).inSingletonScope()

  bind(MongoDBPayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<PayloadDiviner>(TYPES.PayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()

  bind(MongoDBAddressPayloadStatsDiviner).toDynamicValue(getMongoDBAddressPayloadStatsDiviner).inSingletonScope()
  bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toDynamicValue(getMongoDBAddressPayloadStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBAddressPayloadStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressPayloadStatsDiviner).inSingletonScope()

  bind(MongoDBArchiveSchemaStatsDiviner).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
})
