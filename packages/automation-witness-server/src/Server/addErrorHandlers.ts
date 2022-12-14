import { standardErrors } from '@xylabs/sdk-api-express-ecs'
import { Express } from 'express'

export const addErrorHandlers = (app: Express) => {
  app.use(standardErrors)
  return app
}
