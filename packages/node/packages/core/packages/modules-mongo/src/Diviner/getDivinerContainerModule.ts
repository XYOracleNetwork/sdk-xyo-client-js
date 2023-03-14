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
import { Container, ContainerModule, interfaces } from 'inversify'

import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBArchiveBoundWitnessStatsDiviner, MongoDBArchiveBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBArchivePayloadStatsDiviner, MongoDBArchivePayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBArchiveSchemaStatsDiviner, MongoDBArchiveSchemaStatsDivinerConfigSchema } from './SchemaStats'

export const getDivinerContainerModule = async (_container: Container) => {
  const mongoDBAddressHistoryDiviner = (await MongoDBAddressHistoryDiviner.create({
    config: { name: TYPES.AddressHistoryDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  })) as MongoDBAddressHistoryDiviner
  const mongoDBAddressSpaceDiviner = (await MongoDBAddressSpaceDiviner.create({
    config: { name: TYPES.AddressSpaceDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  })) as MongoDBAddressSpaceDiviner
  const mongoDBBoundWitnessDiviner = (await MongoDBBoundWitnessDiviner.create({
    config: { name: TYPES.BoundWitnessDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  })) as MongoDBBoundWitnessDiviner
  const mongoDBArchiveBoundWitnessStatsDiviner = (await MongoDBArchiveBoundWitnessStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema },
  })) as MongoDBArchiveBoundWitnessStatsDiviner
  const mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    config: { schema: XyoDivinerConfigSchema },
  })) as MongoDBLocationCertaintyDiviner
  const mongoDBModuleAddressDiviner = (await MongoDBModuleAddressDiviner.create({
    config: { name: TYPES.ModuleAddressDiviner.description, schema: XyoDivinerConfigSchema },
  })) as MongoDBModuleAddressDiviner
  const mongoDBPayloadDiviner = (await MongoDBPayloadDiviner.create({
    config: { name: TYPES.PayloadDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  })) as MongoDBPayloadDiviner
  const mongoDBArchivePayloadStatsDiviner = (await MongoDBArchivePayloadStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.PayloadStatsDiviner.description, schema: MongoDBArchivePayloadStatsDivinerConfigSchema },
  })) as MongoDBArchivePayloadStatsDiviner
  const mongoDBArchiveSchemaStatsDiviner = (await MongoDBArchiveSchemaStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBArchiveSchemaStatsDivinerConfigSchema },
  })) as MongoDBArchiveSchemaStatsDiviner

  return new ContainerModule((bind: interfaces.Bind) => {
    bind(MongoDBAddressHistoryDiviner).toConstantValue(mongoDBAddressHistoryDiviner)
    bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toService(MongoDBAddressHistoryDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressHistoryDiviner)

    bind(MongoDBAddressSpaceDiviner).toConstantValue(mongoDBAddressSpaceDiviner)
    bind<AddressSpaceDiviner>(TYPES.AddressSpaceDiviner).toService(MongoDBAddressSpaceDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressSpaceDiviner)

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
