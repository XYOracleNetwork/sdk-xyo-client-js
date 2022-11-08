/* eslint-disable max-statements */
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
import { MongoDBArchiveBoundWitnessStatsDiviner } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBArchivePayloadStatsDiviner } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner } from './SchemaStats'

export const DivinerContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBAddressHistoryDiviner).toConstantValue(new MongoDBAddressHistoryDiviner())
  bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toService(MongoDBAddressHistoryDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBAddressHistoryDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBAddressHistoryDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBAddressHistoryDiviner)

  bind(MongoDBBoundWitnessDiviner).toConstantValue(new MongoDBBoundWitnessDiviner())
  bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toService(MongoDBBoundWitnessDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBBoundWitnessDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBBoundWitnessDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBBoundWitnessDiviner)

  bind(MongoDBArchiveBoundWitnessStatsDiviner).toDynamicValue((context) => {
    const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
    return new MongoDBArchiveBoundWitnessStatsDiviner(archiveArchivist)
  })
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toService(MongoDBArchiveBoundWitnessStatsDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchiveBoundWitnessStatsDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBArchiveBoundWitnessStatsDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBArchiveBoundWitnessStatsDiviner)

  bind(MongoDBLocationCertaintyDiviner).toConstantValue(new MongoDBLocationCertaintyDiviner())
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toService(MongoDBLocationCertaintyDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBLocationCertaintyDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBLocationCertaintyDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBLocationCertaintyDiviner)

  bind(MongoDBModuleAddressDiviner).toDynamicValue((context) => {
    const archiveArchivist: ArchiveArchivist = context.container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
    return new MongoDBModuleAddressDiviner(archiveArchivist)
  })
  bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toService(MongoDBModuleAddressDiviner)
  bind<JobProvider>(TYPES.JobProvider).toService(MongoDBModuleAddressDiviner)
  bind<Module>(TYPES.Module).toService(MongoDBModuleAddressDiviner)
  bind<Initializable>(TYPES.Initializable).toService(MongoDBModuleAddressDiviner)

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
