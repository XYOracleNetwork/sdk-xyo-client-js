/* eslint-disable max-statements */
import { AddressHistoryDiviner, XyoArchivistPayloadDivinerConfigSchema, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { Module } from '@xyo-network/module'
import {
  ArchiveArchivist,
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
import { Container, ContainerModule, interfaces } from 'inversify'

import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBArchiveBoundWitnessStatsDiviner, MongoDBArchiveBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBArchivePayloadStatsDiviner, MongoDBArchivePayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner, MongoDBArchiveSchemaStatsDivinerConfigSchema } from './SchemaStats'

export const getDivinerContainerModule = async (container: Container) => {
  const archiveArchivist: ArchiveArchivist = container.get<ArchiveArchivist>(TYPES.ArchiveArchivist)
  const mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create({
    config: { schema: XyoArchivistPayloadDivinerConfigSchema },
  })
  const mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create({ config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  const mongoDBArchiveBoundWitnessStatsDiviner = await MongoDBArchiveBoundWitnessStatsDiviner.create({
    archiveArchivist,
    config: { schema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema },
  })
  const mongoDBLocationCertaintyDiviner = await MongoDBLocationCertaintyDiviner.create()
  const mongoDBModuleAddressDiviner = await MongoDBModuleAddressDiviner.create({ config: { schema: XyoDivinerConfigSchema } })
  const mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create({ config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  const mongoDBArchivePayloadStatsDiviner = await MongoDBArchivePayloadStatsDiviner.create({
    archiveArchivist,
    config: { schema: MongoDBArchivePayloadStatsDivinerConfigSchema },
  })
  const mongoDBArchiveSchemaStatsDiviner = await MongoDBArchiveSchemaStatsDiviner.create({
    archiveArchivist,
    config: { schema: MongoDBArchiveSchemaStatsDivinerConfigSchema },
  })

  return new ContainerModule((bind: interfaces.Bind) => {
    bind(MongoDBAddressHistoryDiviner).toConstantValue(mongoDBAddressHistoryDiviner)
    bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toService(MongoDBAddressHistoryDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBAddressHistoryDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressHistoryDiviner)

    bind(MongoDBBoundWitnessDiviner).toConstantValue(mongoDBBoundWitnessDiviner)
    bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toService(MongoDBBoundWitnessDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBBoundWitnessDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBBoundWitnessDiviner)

    bind(MongoDBArchiveBoundWitnessStatsDiviner).toConstantValue(mongoDBArchiveBoundWitnessStatsDiviner)
    bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toService(MongoDBArchiveBoundWitnessStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchiveBoundWitnessStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBArchiveBoundWitnessStatsDiviner)

    bind(MongoDBLocationCertaintyDiviner).toConstantValue(mongoDBLocationCertaintyDiviner)
    bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toService(MongoDBLocationCertaintyDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBLocationCertaintyDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBLocationCertaintyDiviner)

    bind(MongoDBModuleAddressDiviner).toConstantValue(mongoDBModuleAddressDiviner)
    bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toService(MongoDBModuleAddressDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBModuleAddressDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBModuleAddressDiviner)

    bind(MongoDBPayloadDiviner).toConstantValue(mongoDBPayloadDiviner)
    bind<PayloadDiviner>(TYPES.PayloadDiviner).toService(MongoDBPayloadDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBPayloadDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBPayloadDiviner)

    bind(MongoDBArchivePayloadStatsDiviner).toConstantValue(mongoDBArchivePayloadStatsDiviner)
    bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toService(MongoDBArchivePayloadStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchivePayloadStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBArchivePayloadStatsDiviner)

    bind(MongoDBArchiveSchemaStatsDiviner).toConstantValue(mongoDBArchiveSchemaStatsDiviner)
    bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toService(MongoDBArchiveSchemaStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBArchiveSchemaStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBArchiveSchemaStatsDiviner)
  })
}
