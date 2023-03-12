import { assertEx } from '@xylabs/assert'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { AbstractArchivist, AbstractNode } from '@xyo-network/modules'
import { ArchiveBoundWitnessArchivistFactory, ArchivePayloadArchivistFactory, UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(dependencies.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(dependencies.get<AbstractNode>(TYPES.Node), 'Missing AbstractNode')
  addManagers(app)
  addArchivists(app)
}

const addArchivists = (app: Application) => {
  app.archivist = assertEx(dependencies.get<AbstractArchivist>(TYPES.Archivist), 'Missing Archivist')
  app.archiveBoundWitnessArchivistFactory = assertEx(
    dependencies.get<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory),
    'Missing ArchiveBoundWitnessArchivistFactory',
  )
  app.archivePayloadsArchivistFactory = assertEx(
    dependencies.get<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory),
    'Missing ArchivePayloadArchivistFactory',
  )
}

const addManagers = (app: Application) => {
  app.userManager = assertEx(dependencies.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
}
