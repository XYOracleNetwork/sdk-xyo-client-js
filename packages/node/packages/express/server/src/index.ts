import { assertEx } from '@xylabs/assert'
import { Logger } from '@xylabs/sdk-api-express-ecs'
import { configureDependencies, dependencies } from '@xyo-network/express-node-dependencies'
import { configureDoc } from '@xyo-network/express-node-middleware'
import { addRoutes } from '@xyo-network/express-node-routes'
import { AbstractNode, MemoryNode } from '@xyo-network/modules'
import { TYPES } from '@xyo-network/node-core-types'
import compression from 'compression'
import cors from 'cors'
import express, { Express } from 'express'

import { addAuth } from './addAuth'
import { addDependencies } from './addDependencies'
import { addErrorHandlers } from './addErrorHandlers'
import { addMiddleware } from './addMiddleware'
import { addQueryConverters } from './addQueryConverters'
import { addQueryProcessing } from './addQueryProcessing'
import { addQueryProcessors } from './addQueryProcessors'
import { configureEnvironment } from './configureEnvironment'
import { initializeJobs } from './initializeJobs'

export abstract class PayloadTransport {
  constructor(protected readonly node: AbstractNode) {}
}
export class ExpressPayloadTransport extends PayloadTransport {
  private _app: Express = express()
  constructor(node: AbstractNode) {
    super(node)
    this.app.set('etag', false)
    this.app.use(cors())
    this.app.use(compression())
    addDependencies(this.app)
    addMiddleware(this.app)
    addAuth(this.app)
    addQueryProcessors(this.app)
    addRoutes(this.app)
    addErrorHandlers(this.app)
  }
  public get app(): Express {
    return this._app
  }
  public set app(v: Express) {
    this._app = v
  }
}

export const getApp = async (node?: MemoryNode): Promise<Express> => {
  await configureEnvironment()
  await configureDependencies(node)
  const n = node ?? assertEx(dependencies.get<AbstractNode>(TYPES.Node))
  const transport = new ExpressPayloadTransport(n)
  addQueryConverters()
  addQueryProcessing()
  await initializeJobs()
  return transport.app
}

export const server = async (port = 80, node?: MemoryNode) => {
  const app = await getApp(node)
  const logger = dependencies.get<Logger>(TYPES.Logger)
  const host = process.env.PUBLIC_ORIGIN || `http://localhost:${port}`
  await configureDoc(app, { host })
  const server = app.listen(port, () => {
    logger.log(`Server listening at http://localhost:${port}`)
  })
  server.setTimeout(3000)
}
