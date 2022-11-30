import { assertEx } from '@xylabs/assert'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { SchemaToQueryProcessorRegistry, XyoPayloadToQueryConverterRegistry } from '@xyo-network/express-node-middleware'
import { AbstractNode, AddressHistoryDiviner } from '@xyo-network/modules'
import {
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
  app.node = assertEx(dependencies.get<AbstractNode>(TYPES.Node), 'Missing AbstractNode')
  app.userManager = assertEx(dependencies.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
  addArchivists(app)
  await addDiviners(app)
  addQueryProcessing(app)
}

const addArchivists = (app: Application) => {
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
  app.addressHistoryDiviner = assertEx(
    await dependencies.getAsync<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner),
    'Missing AddressHistoryDiviner',
  )
  app.boundWitnessDiviner = assertEx(await dependencies.getAsync<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner), 'Missing BoundWitnessDiviner')
  app.boundWitnessStatsDiviner = assertEx(
    await dependencies.getAsync<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner),
    'Missing BoundWitnessStatsDiviner',
  )
  app.moduleAddressDiviner = assertEx(await dependencies.getAsync<ModuleAddressDiviner>(TYPES.ModuleAddressDiviner), 'Missing ModuleAddressDiviner')
  app.payloadDiviner = assertEx(await dependencies.getAsync<PayloadDiviner>(TYPES.PayloadDiviner), 'Missing PayloadDiviner')
  app.payloadStatsDiviner = assertEx(await dependencies.getAsync<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner), 'Missing PayloadStatsDiviner')
  app.schemaStatsDiviner = assertEx(await dependencies.getAsync<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner), 'Missing SchemaStatsDiviner')
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
