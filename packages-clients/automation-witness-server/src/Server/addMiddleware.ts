import {
  customPoweredByHeader,
  disableCaseSensitiveRouting,
  disableExpressDefaultPoweredByHeader,
  jsonBodyParser,
  responseProfiler,
  useRequestCounters,
} from '@xylabs/sdk-api-express-ecs'
import { Express } from 'express'

export const addMiddleware = (app: Express) => {
  app.use(responseProfiler)
  app.use(jsonBodyParser)
  disableExpressDefaultPoweredByHeader(app)
  app.use(customPoweredByHeader)
  disableCaseSensitiveRouting(app)
  useRequestCounters(app)
}
