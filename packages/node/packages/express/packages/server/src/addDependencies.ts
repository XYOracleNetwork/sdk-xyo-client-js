import { assertEx } from '@xylabs/assert'
import { container } from '@xyo-network/express-node-dependencies'
import { TYPES } from '@xyo-network/node-core-types'
import { DirectNodeModule } from '@xyo-network/node-model'
import { Logger } from '@xyo-network/shared'
import { Application } from 'express'

export const addDependencies = (app: Application) => {
  app.logger = assertEx(container.get<Logger>(TYPES.Logger), 'Missing Logger')
  app.node = assertEx(container.get<DirectNodeModule>(TYPES.Node), 'Missing Node')
}
