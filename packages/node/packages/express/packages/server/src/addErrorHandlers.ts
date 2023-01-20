import { standardErrors } from '@xylabs/sdk-api-express-ecs'
import { getLoggingErrorHandler } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

export const addErrorHandlers = (app: Express) => {
  app.use(getLoggingErrorHandler(app.logger))
  app.use(standardErrors)
}
