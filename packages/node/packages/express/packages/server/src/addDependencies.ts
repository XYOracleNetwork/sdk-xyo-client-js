import { assertEx } from '@xylabs/assert'
import { container } from '@xyo-network/express-node-dependencies'
import { AbstractArchivist, AbstractNode } from '@xyo-network/modules'
import { UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(container.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(container.get<AbstractNode>(TYPES.Node), 'Missing AbstractNode')
  app.archivist = assertEx(container.get<AbstractArchivist>(TYPES.Archivist), 'Missing Archivist')
  app.userManager = assertEx(container.get<UserManager>(TYPES.UserManager), 'Missing UserManager')
}
