import { assertEx } from '@xylabs/assert'
import { dependencies } from '@xyo-network/express-node-dependencies'
import { AbstractArchivist, AbstractNode } from '@xyo-network/modules'
import { UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(dependencies.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(dependencies.get<AbstractNode>(TYPES.Node), 'Missing AbstractNode')
  app.archivist = assertEx(dependencies.get<AbstractArchivist>(TYPES.Archivist), 'Missing Archivist')
  app.userManager = assertEx(dependencies.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
}
