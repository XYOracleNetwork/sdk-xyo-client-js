import { assertEx } from '@xylabs/assert'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { SchemaToQueryProcessorRegistry, XyoPayloadToQueryConverterRegistry } from '@xyo-network/express-node-middleware'
import {
  AddressHistoryDiviner,
  ArchiveArchivist,
  ArchiveBoundWitnessArchivistFactory,
  ArchiveKeyArchivist,
  ArchivePayloadsArchivistFactory,
  ArchivePermissionsArchivistFactory,
  BoundWitnessArchivist,
  BoundWitnessDiviner,
  BoundWitnessStatsDiviner,
  IdentifiableHuri,
  ModuleAddressDiviner,
  ModuleRegistry,
  PayloadArchivist,
  PayloadDiviner,
  PayloadStatsDiviner,
  Query,
  Queue,
  SchemaStatsDiviner,
  UserManager,
  WitnessedPayloadArchivist,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = async (app: Application) => {
  app.logger = assertEx(dependencies.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.moduleRegistry = assertEx(dependencies.get<ModuleRegistry>(TYPES.ModuleRegistry), 'Missing ModuleRegistry')
  app.userManager = assertEx(dependencies.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
  addArchivists(app)
  await addDiviners(app)
  addQueryProcessing(app)
}

const addArchivists = (app: Application) => {
  app.addressHistoryDiviner = assertEx(dependencies.get<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner), 'Missing AddressHistoryDiviner')
  app.archiveArchivist = assertEx(dependencies.get<ArchiveArchivist>(TYPES.ArchiveArchivist), 'Missing ArchiveArchivist')
  app.archiveBoundWitnessArchivistFactory = assertEx(
    dependencies.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory),
    'Missing ArchiveBoundWitnessArchivistFactory',
  )
  app.archiveArchivist = assertEx(dependencies.get<ArchiveArchivist>(TYPES.ArchiveArchivist), 'Missing ArchiveArchivist')
  app.archiveKeyArchivist = assertEx(dependencies.get<ArchiveKeyArchivist>(TYPES.ArchiveKeyArchivist), 'Missing ArchiveKeyArchivist')
  app.archivePayloadsArchivistFactory = assertEx(
    dependencies.get<ArchivePayloadsArchivistFactory>(TYPES.ArchivePayloadArchivistFactory),
    'Missing ArchivePayloadsArchivistFactory',
  )
  app.archivePermissionsArchivistFactory = assertEx(
    dependencies.get<ArchivePermissionsArchivistFactory>(TYPES.ArchivePermissionsArchivistFactory),
    'Missing ArchivePermissionsArchivistFactory',
  )
  app.archivistWitnessedPayloadArchivist = assertEx(
    dependencies.get<WitnessedPayloadArchivist>(TYPES.WitnessedPayloadArchivist),
    'Missing ArchivistWitnessedPayloadArchivist',
  )
  app.boundWitnessArchivist = assertEx(dependencies.get<BoundWitnessArchivist>(TYPES.BoundWitnessArchivist), 'Missing BoundWitnessArchivist')
  app.payloadArchivist = assertEx(dependencies.get<PayloadArchivist>(TYPES.PayloadArchivist), 'Missing PayloadArchivist')
}

const addDiviners = async (app: Application) => {
  app.boundWitnessDiviner = assertEx(dependencies.get<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner), 'Missing BoundWitnessDiviner')
  const boundWitnessStatsDiviner = await dependencies.getAsync<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner)
  app.boundWitnessStatsDiviner = assertEx(boundWitnessStatsDiviner, 'Missing BoundWitnessStatsDiviner')
  app.moduleAddressDiviner = assertEx(dependencies.get<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner), 'Missing ModuleAddressDiviner')
  app.payloadDiviner = assertEx(dependencies.get<PayloadDiviner>(TYPES.PayloadDiviner), 'Missing PayloadDiviner')
  app.payloadStatsDiviner = assertEx(dependencies.get<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner), 'Missing PayloadStatsDiviner')
  app.schemaStatsDiviner = assertEx(dependencies.get<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner), 'Missing SchemaStatsDiviner')
}

const addQueryProcessing = (app: Application) => {
  app.queryConverters = assertEx(
    dependencies.get<XyoPayloadToQueryConverterRegistry>(TYPES.PayloadToQueryConverterRegistry),
    'Missing QueryConverters',
  )
  app.queryProcessors = assertEx(dependencies.get<SchemaToQueryProcessorRegistry>(TYPES.SchemaToQueryProcessorRegistry), 'Missing QueryProcessors')
  app.queryQueue = assertEx(dependencies.get<Queue<Query>>(TYPES.QueryQueue), 'Missing QueryQueue')
  app.responseQueue = assertEx(dependencies.get<Queue<IdentifiableHuri>>(TYPES.ResponseQueue), 'Missing ResponseQueue')
}
