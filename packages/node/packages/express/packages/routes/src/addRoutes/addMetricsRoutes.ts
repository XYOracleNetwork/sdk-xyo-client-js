import { adminApiKeyStrategy, allowAnonymous, isDevelopment } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getHealthz, getMetrics } from '../routes'
export const addMetricsRoutes = (app: Express) => {
  app.get(
    '/healthz',
    allowAnonymous,
    getHealthz,
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Used for quick health check' */
  )
  app.get(
    '/metrics',
    isDevelopment() ? allowAnonymous : adminApiKeyStrategy,
    getMetrics /* #swagger.tags = ['Node'] */,
    /* #swagger.summary = 'Gets modules on the Node' */
  )
  app.get(
    '/ready',
    allowAnonymous,
    // TODO: Custom endpoint as readiness !== health
    getHealthz,
    /* #swagger.tags = ['Health'] */
    /* #swagger.summary = 'Used for readiness check' */
  )
}
