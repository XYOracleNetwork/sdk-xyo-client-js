import { Logger } from '@xylabs/sdk-api-express-ecs'
import { configureDependencies, dependencies } from '@xyo-network/express-node-dependencies'
import { configureDoc } from '@xyo-network/express-node-middleware'
import { addRoutes } from '@xyo-network/express-node-routes'
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

export const getApp = async (): Promise<Express> => {
  await configureEnvironment()
  await configureDependencies()

  const app = express()
  app.set('etag', false)
  app.use(cors())
  app.use(compression())

  addDependencies(app)
  addMiddleware(app)
  addAuth(app)
  addQueryConverters()
  addQueryProcessors(app)
  addQueryProcessing()
  await initializeJobs()
  addRoutes(app)
  addErrorHandlers(app)
  return app
}

export const server = async (port = 80) => {
  const app = await getApp()
  const logger = dependencies.get<Logger>(TYPES.Logger)
  const host = process.env.PUBLIC_ORIGIN || `http://localhost:${port}`
  await configureDoc(app, { host })
  const server = app.listen(port, () => {
    logger.log(`Server listening at http://localhost:${port}`)
  })
  server.setTimeout(3000)
}
