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
import { MongoDBAddressBoundWitnessStatsDiviner, MongoDBAddressBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBModuleAddressDiviner } from './ModuleAddress'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBAddressPayloadStatsDiviner, MongoDBAddressPayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBAddressSchemaStatsDiviner, MongoDBAddressSchemaStatsDivinerConfigSchema } from './SchemaStats'

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
  const mongoDBArchiveBoundWitnessStatsDiviner = (await MongoDBAddressBoundWitnessStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBAddressBoundWitnessStatsDivinerConfigSchema },
  })) as MongoDBAddressBoundWitnessStatsDiviner
  const mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    config: { schema: XyoDivinerConfigSchema },
  })) as MongoDBLocationCertaintyDiviner
  const mongoDBModuleAddressDiviner = (await MongoDBModuleAddressDiviner.create({
    config: { name: TYPES.ModuleAddressDiviner.description, schema: XyoDivinerConfigSchema },
  })) as MongoDBModuleAddressDiviner
  const mongoDBPayloadDiviner = (await MongoDBPayloadDiviner.create({
    config: { name: TYPES.PayloadDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  })) as MongoDBPayloadDiviner
  const mongoDBAddressPayloadStatsDiviner = (await MongoDBAddressPayloadStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.PayloadStatsDiviner.description, schema: MongoDBAddressPayloadStatsDivinerConfigSchema },
  })) as MongoDBAddressPayloadStatsDiviner
  const mongoDBArchiveSchemaStatsDiviner = (await MongoDBAddressSchemaStatsDiviner.create({
    addressSpaceDiviner: mongoDBAddressSpaceDiviner,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBAddressSchemaStatsDivinerConfigSchema },
  })) as MongoDBAddressSchemaStatsDiviner

  return new ContainerModule((bind: interfaces.Bind) => {
    bind(MongoDBAddressHistoryDiviner).toConstantValue(mongoDBAddressHistoryDiviner)
    bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toService(MongoDBAddressHistoryDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressHistoryDiviner)

    bind(MongoDBAddressSpaceDiviner).toConstantValue(mongoDBAddressSpaceDiviner)
    bind<AddressSpaceDiviner>(TYPES.AddressSpaceDiviner).toService(MongoDBAddressSpaceDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressSpaceDiviner)

    bind(MongoDBBoundWitnessDiviner).toConstantValue(mongoDBBoundWitnessDiviner)
    bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toService(MongoDBBoundWitnessDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBBoundWitnessDiviner)

    bind(MongoDBAddressBoundWitnessStatsDiviner).toConstantValue(mongoDBArchiveBoundWitnessStatsDiviner)
    bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toService(MongoDBAddressBoundWitnessStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBAddressBoundWitnessStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressBoundWitnessStatsDiviner)

    bind(MongoDBLocationCertaintyDiviner).toConstantValue(mongoDBLocationCertaintyDiviner)
    bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toService(MongoDBLocationCertaintyDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBLocationCertaintyDiviner)

    bind(MongoDBModuleAddressDiviner).toConstantValue(mongoDBModuleAddressDiviner)
    bind<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner).toService(MongoDBModuleAddressDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBModuleAddressDiviner)

    bind(MongoDBPayloadDiviner).toConstantValue(mongoDBPayloadDiviner)
    bind<PayloadDiviner>(TYPES.PayloadDiviner).toService(MongoDBPayloadDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBPayloadDiviner)

    bind(MongoDBAddressPayloadStatsDiviner).toConstantValue(mongoDBAddressPayloadStatsDiviner)
    bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toService(MongoDBAddressPayloadStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBAddressPayloadStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressPayloadStatsDiviner)

    bind(MongoDBAddressSchemaStatsDiviner).toConstantValue(mongoDBArchiveSchemaStatsDiviner)
    bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toService(MongoDBAddressSchemaStatsDiviner)
    bind<JobProvider>(TYPES.JobProvider).toService(MongoDBAddressSchemaStatsDiviner)
    bind<Module>(TYPES.Module).toService(MongoDBAddressSchemaStatsDiviner)
  })
}
