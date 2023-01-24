import { assertEx } from '@xylabs/assert'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { SchemaToQueryProcessorRegistry, XyoPayloadToQueryConverterRegistry } from '@xyo-network/express-node-middleware'
import { AbstractNode } from '@xyo-network/modules'
import {
  ArchiveArchivist,
  ArchiveBoundWitnessArchivistFactory,
  ArchiveKeyRepository,
  ArchivePayloadArchivistFactory,
  ArchivePermissionsArchivistFactory,
  IdentifiableHuri,
  Query,
  Queue,
  UserManager,
  WitnessedPayloadArchivist,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(dependencies.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(dependencies.get<AbstractNode>(TYPES.Node), 'Missing AbstractNode')
  addRepositories(app)
  addManagers(app)
  addArchivists(app)
  addQueryProcessing(app)
}

const addArchivists = (app: Application) => {
  app.archiveBoundWitnessArchivistFactory = assertEx(
    dependencies.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory),
    'Missing ArchiveBoundWitnessArchivistFactory',
  )
  app.archivePayloadsArchivistFactory = assertEx(
    dependencies.get<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory),
    'Missing ArchivePayloadArchivistFactory',
  )
  app.archivePermissionsArchivistFactory = assertEx(
    dependencies.get<ArchivePermissionsArchivistFactory>(TYPES.ArchivePermissionsArchivistFactory),
    'Missing ArchivePermissionsArchivistFactory',
  )
}

const addRepositories = (app: Application) => {
  app.archiveArchivist = assertEx(dependencies.get<ArchiveArchivist>(TYPES.ArchiveArchivist), 'Missing ArchiveArchivist')
  app.archiveKeyRepository = assertEx(dependencies.get<ArchiveKeyRepository>(TYPES.ArchiveKeyRepository), 'Missing ArchiveKeyRepository')
}

const addManagers = (app: Application) => {
  app.userManager = assertEx(dependencies.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
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
