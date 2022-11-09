/* eslint-disable max-statements */
import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { Module } from '@xyo-network/module'
import {
  AddressHistoryDiviner,
  ArchiveArchivist,
  BoundWitnessDiviner,
  BoundWitnessStatsDiviner,
  Initializable,
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
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBArchiveBoundWitnessStatsDiviner, MongoDBArchiveBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner, MongoDBModuleAddressDivinerConfigSchema } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBArchivePayloadStatsDiviner } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner } from './SchemaStats'

let mongoDBAddressHistoryDiviner: MongoDBAddressHistoryDiviner
let mongoDBBoundWitnessDiviner: MongoDBBoundWitnessDiviner
let mongoDBArchiveBoundWitnessStatsDiviner: MongoDBArchiveBoundWitnessStatsDiviner
let mongoDBLocationCertaintyDiviner: MongoDBLocationCertaintyDiviner
let mongoDBModuleAddressDiviner: MongoDBModuleAddressDiviner
let mongoDBPayloadDiviner: MongoDBPayloadDiviner

const getMongoDBAddressHistoryDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBBoundWitnessDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create(params)
  return mongoDBBoundWitnessDiviner
}
const getMongoDBArchiveBoundWitnessStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBArchiveBoundWitnessStatsDiviner) return mongoDBArchiveBoundWitnessStatsDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema } }
  mongoDBArchiveBoundWitnessStatsDiviner = await MongoDBArchiveBoundWitnessStatsDiviner.create(params)
  return mongoDBArchiveBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async () => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  mongoDBLocationCertaintyDiviner = await MongoDBLocationCertaintyDiviner.create()
  return mongoDBLocationCertaintyDiviner
}
const getMongoDBModuleAddressDiviner = async (context: interfaces.Context) => {
  if (mongoDBModuleAddressDiviner) return mongoDBModuleAddressDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: MongoDBModuleAddressDivinerConfigSchema } }
  mongoDBModuleAddressDiviner = await MongoDBModuleAddressDiviner.create(params)
  return mongoDBModuleAddressDiviner
}
const getMongoDBPayloadDiviner = async () => {
  if (mongoDBPayloadDiviner) return mongoDBPayloadDiviner
  const params = { config: { schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create(params)
  return mongoDBPayloadDiviner
}

export const DivinerContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBAddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner)
  bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBAddressHistoryDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressHistoryDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBAddressHistoryDiviner)

  bind(MongoDBBoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner)
  bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBBoundWitnessDiviner)

  bind(MongoDBArchiveBoundWitnessStatsDiviner).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner)
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBArchiveBoundWitnessStatsDiviner)

  bind(MongoDBLocationCertaintyDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner)
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBLocationCertaintyDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBLocationCertaintyDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBLocationCertaintyDiviner)

  bind(MongoDBModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBModuleAddressDiviner)

  bind(MongoDBPayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner)
  bind<PayloadDiviner>(TYPES.PayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBPayloadDiviner)

  bind(MongoDBArchivePayloadStatsDiviner).toDynamicValue((context) => {
    const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
    return new MongoDBArchivePayloadStatsDiviner(archiveArchivist)
  })
  bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toService(MongoDBArchivePayloadStatsDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchivePayloadStatsDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBArchivePayloadStatsDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBArchivePayloadStatsDiviner)

  bind(MongoDBArchiveSchemaStatsDiviner).toDynamicValue((context) => {
    const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
    return new MongoDBArchiveSchemaStatsDiviner(archiveArchivist)
  })
  bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toService(MongoDBArchiveSchemaStatsDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchiveSchemaStatsDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBArchiveSchemaStatsDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBArchiveSchemaStatsDiviner)
})
