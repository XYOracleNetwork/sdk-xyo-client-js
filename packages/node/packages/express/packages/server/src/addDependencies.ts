import { assertEx } from '@xylabs/assert'
import { container } from '@xyo-network/express-node-dependencies'
import { AbstractNode } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(container.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(container.get<AbstractNode>(TYPES.Node), 'Missing Node')
}
