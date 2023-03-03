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
import { MongoDBArchiveBoundWitnessStatsDiviner, MongoDBArchiveBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBArchivePayloadStatsDiviner, MongoDBArchivePayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner, MongoDBArchiveSchemaStatsDivinerConfigSchema } from './SchemaStats'

let mongoDBAddressHistoryDiviner: MongoDBAddressHistoryDiviner
let mongoDBAddressSpaceDiviner: MongoDBAddressSpaceDiviner
let mongoDBBoundWitnessDiviner: MongoDBBoundWitnessDiviner
let mongoDBArchiveBoundWitnessStatsDiviner: MongoDBArchiveBoundWitnessStatsDiviner
let mongoDBLocationCertaintyDiviner: MongoDBLocationCertaintyDiviner
let mongoDBModuleAddressDiviner: MongoDBModuleAddressDiviner
let mongoDBPayloadDiviner: MongoDBPayloadDiviner
let mongoDBArchivePayloadStatsDiviner: MongoDBArchivePayloadStatsDiviner
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
const getMongoDBArchiveBoundWitnessStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBArchiveBoundWitnessStatsDiviner) return mongoDBArchiveBoundWitnessStatsDiviner
  const params = {
    config: { name: TYPES.ArchiveBoundWitnessStatsDiviner.description, schema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema },
  }
  mongoDBArchiveBoundWitnessStatsDiviner = await MongoDBArchiveBoundWitnessStatsDiviner.create(params)
  return mongoDBArchiveBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async () => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  mongoDBLocationCertaintyDiviner = await MongoDBLocationCertaintyDiviner.create({
    config: { schema: XyoDivinerConfigSchema },
  })
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
const getMongoDBArchivePayloadStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBArchivePayloadStatsDiviner) return mongoDBArchivePayloadStatsDiviner
  const params = {
    config: { name: TYPES.ArchivePayloadStatsDiviner.description, schema: MongoDBArchivePayloadStatsDivinerConfigSchema },
  }
  mongoDBArchivePayloadStatsDiviner = await MongoDBArchivePayloadStatsDiviner.create(params)
  return mongoDBArchivePayloadStatsDiviner
}
const getMongoDBArchiveSchemaStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBArchiveSchemaStatsDiviner) return mongoDBArchiveSchemaStatsDiviner
  const params = {
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

  bind(MongoDBArchiveBoundWitnessStatsDiviner).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner).inSingletonScope()
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner).inSingletonScope()

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

  bind(MongoDBArchivePayloadStatsDiviner).toDynamicValue(getMongoDBArchivePayloadStatsDiviner).inSingletonScope()
  bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toDynamicValue(getMongoDBArchivePayloadStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBArchivePayloadStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBArchivePayloadStatsDiviner).inSingletonScope()

  bind(MongoDBArchiveSchemaStatsDiviner).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBArchiveSchemaStatsDiviner).inSingletonScope()
})
