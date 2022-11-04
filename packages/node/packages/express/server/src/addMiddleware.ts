import {
  customPoweredByHeader,
  disableCaseSensitiveRouting,
  disableExpressDefaultPoweredByHeader,
  jsonBodyParser,
  responseProfiler,
  useRequestCounters,
} from '@xylabs/sdk-api-express-ecs'
import { archiveLocals, standardResponses } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

export const addMiddleware = (app: Express) => {
  app.use(responseProfiler)
  app.use(jsonBodyParser)
  app.use(standardResponses)
  disableExpressDefaultPoweredByHeader(app)
  app.use(customPoweredByHeader)
  disableCaseSensitiveRouting(app)
  app.use('/archive/:archive', archiveLocals)
  useRequestCounters(app)
}
