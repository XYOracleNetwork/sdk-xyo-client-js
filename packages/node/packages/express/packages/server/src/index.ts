import { Logger } from '@xylabs/sdk-api-express-ecs'
import { configureDependencies, container } from '@xyo-network/express-node-dependencies'
import { configureDoc } from '@xyo-network/express-node-middleware'
import { addRoutes } from '@xyo-network/express-node-routes'
import { TYPES } from '@xyo-network/node-core-types'
import { MemoryNode } from '@xyo-network/node-memory'
import { NodeInstance } from '@xyo-network/node-model'
import compression from 'compression'
import cors from 'cors'
import express, { Express } from 'express'

import { addDependencies } from './addDependencies'
import { addErrorHandlers } from './addErrorHandlers'
import { addMiddleware } from './addMiddleware'
import { configureEnvironment } from './configureEnvironment'
import { startJobQueue } from './startJobQueue'

const hostname = '::'

export abstract class PayloadTransport {
  constructor(protected readonly node: NodeInstance) {}
}

export class ExpressPayloadTransport extends PayloadTransport {
  private _app: Express = express()
  constructor(node: NodeInstance) {
    super(node)
    this.app.set('etag', false)
    this.app.use(cors())
    this.app.use(compression())
    addDependencies(this.app)
    addMiddleware(this.app)
    addRoutes(this.app)
    addErrorHandlers(this.app)
  }
  get app(): Express {
    return this._app
  }
  set app(v: Express) {
    this._app = v
  }
}

export const getApp = async (node?: NodeInstance): Promise<Express> => {
  node = node ?? (await MemoryNode.create())
  await configureEnvironment()
  await configureDependencies(node)
  const transport = new ExpressPayloadTransport(node)
  return transport.app
}

export const getServer = async (port = 80, node?: MemoryNode) => {
  node = node ?? (await MemoryNode.create())
  const app = await getApp(node)
  await startJobQueue()
  const logger = container.get<Logger>(TYPES.Logger)
  const host = process.env.PUBLIC_ORIGIN || `http://${hostname}:${port}`
  await configureDoc(app, { host })
  const server = app.listen(port, hostname, () => logger.log(`Server listening at http://${hostname}:${port}`))
  server.setTimeout(20000)
  return server
}
