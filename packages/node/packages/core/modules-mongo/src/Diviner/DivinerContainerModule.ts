/* eslint-disable max-statements */
import { XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { Module, XyoModuleConfigSchema } from '@xyo-network/module'
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
let mongoDBModuleAddressDiviner: MongoDBModuleAddressDiviner

const getMongoDBAddressHistoryDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: XyoDivinerConfigSchema } }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBBoundWitnessDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: XyoDivinerConfigSchema } }
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
const getMongoDBModuleAddressDiviner = async (context: interfaces.Context) => {
  if (mongoDBModuleAddressDiviner) return mongoDBModuleAddressDiviner
  const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const params = { config: { archiveArchivist, schema: MongoDBModuleAddressDivinerConfigSchema } }
  mongoDBModuleAddressDiviner = await MongoDBModuleAddressDiviner.create(params)
  return mongoDBModuleAddressDiviner
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

  bind(MongoDBLocationCertaintyDiviner).toConstantValue(new MongoDBLocationCertaintyDiviner())
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toService(MongoDBLocationCertaintyDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBLocationCertaintyDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBLocationCertaintyDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBLocationCertaintyDiviner)

  bind(MongoDBModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBModuleAddressDiviner)
  bind<Initializable>(TYPES.Initializable).toDynamicValue(getMongoDBModuleAddressDiviner)

  bind(MongoDBPayloadDiviner).toConstantValue(new MongoDBPayloadDiviner())
  bind<PayloadDiviner>(TYPES.PayloadDiviner).toService(MongoDBPayloadDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBPayloadDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBPayloadDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBPayloadDiviner)

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
