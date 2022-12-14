import { getDefaultLogger, getEnvFromAws } from '@xylabs/sdk-api-express-ecs'
import compression from 'compression'
import cors from 'cors'
import express, { Express } from 'express'

import { addDependencies } from './addDependencies'
import { addDistributedJobs } from './addDistributedJobs'
import { addErrorHandlers } from './addErrorHandlers'
import { addHealthChecks } from './addHealthChecks'
import { addMiddleware } from './addMiddleware'

export const getApp = (): Express => {
  const app = express()
  app.set('etag', false)
  app.use(cors())
  app.use(compression())
  addDependencies(app)
  addMiddleware(app)
  addHealthChecks(app)
  addErrorHandlers(app)
  return app
}

export const server = async (port = 80) => {
  // If an AWS ARN was supplied for Secrets Manager
  const awsEnvSecret = process.env.AWS_ENV_SECRET_ARN
  if (awsEnvSecret) {
    // Merge the values from AWS into the current ENV
    // with AWS taking precedence
    const awsEnv = await getEnvFromAws(awsEnvSecret)
    Object.assign(process.env, awsEnv)
  }

  const logger = getDefaultLogger()
  const app = getApp()
  await addDistributedJobs(app)
  const server = app.listen(port, () => {
    logger.log(`Server listening at http://localhost:${port}`)
  })

  server.setTimeout(3000)
}
