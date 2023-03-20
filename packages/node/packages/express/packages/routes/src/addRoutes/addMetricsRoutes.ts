import { adminApiKeyStrategy } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getMetrics } from '../routes'

export const addMetricsRoutes = (app: Express) => {
  app.get(
    '/metrics',
    adminApiKeyStrategy,
    getMetrics /* #swagger.tags = ['Node'] */,
    /* #swagger.summary = 'Gets modules on the Node' */
  )
}
